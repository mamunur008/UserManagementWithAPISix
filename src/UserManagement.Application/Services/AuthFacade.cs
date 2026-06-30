using Microsoft.Extensions.Options;
using UserManagement.Application.Abstractions;
using UserManagement.Application.Configuration;
using UserManagement.Application.DTOs;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Services;

// Kept only for local API tests. Production login/logout are performed by Keycloak OIDC from the frontend.
public sealed class AuthFacade
{
    private readonly IKeycloakAuthClient _keycloak; private readonly ISessionStore _sessions; private readonly SessionOptions _options;
    public AuthFacade(IKeycloakAuthClient keycloak, ISessionStore sessions, IOptions<SessionOptions> options){_keycloak=keycloak;_sessions=sessions;_options=options.Value;}
    public async Task<LoginResponse> LoginAsync(LoginRequest request,CancellationToken ct)
    { var token=await _keycloak.PasswordLoginAsync(request.Username,request.Password,ct); var profile=await _keycloak.GetUserInfoAsync(token.AccessToken,ct); var sessionId=Guid.NewGuid().ToString("N"); var expires=DateTimeOffset.UtcNow.AddMinutes(Math.Min(_options.TtlMinutes, Math.Max(1, token.ExpiresIn/60))); await _sessions.SaveAsync(new AuthSession(sessionId,profile.Id,profile.Username,profile.Email??string.Empty,profile.Roles.ToArray(),expires,token.AccessToken),ct); return new LoginResponse(sessionId,token.AccessToken,token.RefreshToken,token.ExpiresIn,token.TokenType,profile); }
    public Task LogoutAsync(string sessionId,CancellationToken ct)=>_sessions.RemoveAsync(sessionId,ct);
}
