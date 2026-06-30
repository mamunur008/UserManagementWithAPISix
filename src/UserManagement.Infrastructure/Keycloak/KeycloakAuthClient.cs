using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using UserManagement.Application.Abstractions;
using UserManagement.Application.Configuration;
using UserManagement.Application.DTOs;
using UserManagement.Domain.Errors;

namespace UserManagement.Infrastructure.Keycloak;

public sealed class KeycloakAuthClient : IKeycloakAuthClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _http;
    private readonly KeycloakOptions _options;
    private readonly JwtSecurityTokenHandler _jwtHandler = new();

    private JsonWebKeySet? _cachedJwks;
    private DateTimeOffset _jwksLoadedAt = DateTimeOffset.MinValue;

    public KeycloakAuthClient(HttpClient http, IOptions<KeycloakOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task<KeycloakTokenResult> PasswordLoginAsync(string username, string password, CancellationToken ct)
    {
        var form = new Dictionary<string, string>
        {
            ["grant_type"] = "password",
            ["client_id"] = _options.PublicClientId,
            ["username"] = username,
            ["password"] = password,
            ["scope"] = "openid profile email"
        };

        var res = await _http.PostAsync($"{_options.RealmBaseUrl}/protocol/openid-connect/token", new FormUrlEncodedContent(form), ct);
        var body = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
            throw new AppException("login_failed", $"Keycloak login failed: {body}", 401);

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;

        return new KeycloakTokenResult(
            root.GetProperty("access_token").GetString()!,
            root.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null,
            root.TryGetProperty("expires_in", out var exp) ? exp.GetInt32() : 300,
            root.TryGetProperty("token_type", out var tt) ? tt.GetString() ?? "Bearer" : "Bearer");
    }

    // Important: APISIX/AuthService should not rely on Keycloak introspection for SPA access tokens.
    // A public SPA token can be validated locally using issuer + JWKS. This also avoids Docker issues
    // where the token issuer is http://localhost:8080 but services reach Keycloak as http://keycloak:8080.
    public async Task<KeycloakTokenIntrospection> IntrospectAsync(string token, CancellationToken ct)
    {
        try
        {
            var jwks = await GetJwksAsync(ct);

            var validIssuers = _options.ValidIssuers is { Length: > 0 }
                ? _options.ValidIssuers
                : new[] { _options.Issuer };

            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = validIssuers,

                // Keycloak access tokens often use aud=account and azp=<client_id>.
                // For gateway auth, validate issuer/signature/lifetime and read azp/roles.
                ValidateAudience = false,

                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = jwks.Keys,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(60),

                RequireSignedTokens = true,
                RequireExpirationTime = true
            };

            _jwtHandler.ValidateToken(token, parameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwt)
            {
                return new KeycloakTokenIntrospection(
                    Active: false,
                    Subject: null,
                    Username: null,
                    Roles: Array.Empty<string>(),
                    Exp: null);
            }

            var subject = jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

            var username =
                jwt.Claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value
                ?? jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value
                ?? subject;

            var roles = ExtractRealmRoles(jwt);

            var exp = jwt.Claims.FirstOrDefault(c => c.Type == "exp")?.Value;
            long? expUnix = long.TryParse(exp, out var parsedExp) ? parsedExp : null;

            return new KeycloakTokenIntrospection(
                Active: !string.IsNullOrWhiteSpace(subject),
                Subject: subject,
                Username: username,
                Roles: roles,
                Exp: expUnix);
        }
        catch
        {
            return new KeycloakTokenIntrospection(
                Active: false,
                Subject: null,
                Username: null,
                Roles: Array.Empty<string>(),
                Exp: null);
        }
    }
    /*
    public async Task<KeycloakTokenIntrospection> IntrospectAsync(string token, CancellationToken ct)
    {
        try
        {
            var jwks = await GetJwksAsync(ct);

            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _options.Issuer,

                // Keycloak access tokens often use aud=account and azp=<client_id>.
                // For gateway auth, validate issuer/signature/lifetime and read azp/roles.
                ValidateAudience = false,

                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = jwks.Keys,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(60),
                RequireSignedTokens = true,
                RequireExpirationTime = true
            };

            _jwtHandler.ValidateToken(token, parameters, out var validatedToken);

            if (validatedToken is not JwtSecurityToken jwt)
                return new KeycloakTokenIntrospection(false, null, null, Array.Empty<string>(), null);

            var subject = jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            var username = jwt.Claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value
                           ?? jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value
                           ?? subject;

            var roles = ExtractRealmRoles(jwt);
            var exp = jwt.Claims.FirstOrDefault(c => c.Type == "exp")?.Value;
            long? expUnix = long.TryParse(exp, out var parsedExp) ? parsedExp : null;

            return new KeycloakTokenIntrospection(
                Active: !string.IsNullOrWhiteSpace(subject),
                Subject: subject,
                Username: username,
                Roles: roles,
                Exp: expUnix);
        }
        catch
        {
            return new KeycloakTokenIntrospection(false, null, null, Array.Empty<string>(), null);
        }
    } */

    public async Task<UserProfileDto> GetUserInfoAsync(string accessToken, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, $"{_options.RealmBaseUrl}/protocol/openid-connect/userinfo");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var res = await _http.SendAsync(req, ct);
        var body = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
        {
            throw new AppException(
                "userinfo_failed",
                $"Keycloak userinfo failed. StatusCode={(int)res.StatusCode} {res.ReasonPhrase}. Body={body}",
                401);
        }

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        var introspection = await IntrospectAsync(accessToken, ct);

        return new UserProfileDto(
            root.TryGetProperty("sub", out var sub) ? sub.GetString() ?? string.Empty : string.Empty,
            root.TryGetProperty("preferred_username", out var username) ? username.GetString() ?? string.Empty : string.Empty,
            root.TryGetProperty("email", out var email) ? email.GetString() : null,
            root.TryGetProperty("given_name", out var firstName) ? firstName.GetString() : null,
            root.TryGetProperty("family_name", out var lastName) ? lastName.GetString() : null,
            introspection.Roles);
    }

    private async Task<JsonWebKeySet> GetJwksAsync(CancellationToken ct)
    {
        if (_cachedJwks is not null && DateTimeOffset.UtcNow - _jwksLoadedAt < TimeSpan.FromMinutes(15))
            return _cachedJwks;

        var json = await _http.GetStringAsync(_options.JwksUrl, ct);
        _cachedJwks = new JsonWebKeySet(json);
        _jwksLoadedAt = DateTimeOffset.UtcNow;
        return _cachedJwks;
    }

    private static IReadOnlyCollection<string> ExtractRealmRoles(JwtSecurityToken jwt)
    {
        var roles = new List<string>();

        foreach (var claim in jwt.Claims.Where(c => c.Type is "role" or "roles" or "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"))
        {
            if (!string.IsNullOrWhiteSpace(claim.Value)) roles.Add(claim.Value);
        }

        var realmAccessJson = jwt.Claims.FirstOrDefault(c => c.Type == "realm_access")?.Value;
        if (!string.IsNullOrWhiteSpace(realmAccessJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(realmAccessJson);
                if (doc.RootElement.TryGetProperty("roles", out var roleArray))
                {
                    roles.AddRange(roleArray.EnumerateArray()
                        .Select(x => x.GetString())
                        .OfType<string>()
                        .Where(x => !string.IsNullOrWhiteSpace(x)));
                }
            }
            catch
            {
                // Ignore malformed role claim. Signature validation has already happened.
            }
        }

        return roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    }
}
