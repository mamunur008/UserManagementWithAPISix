using Microsoft.Extensions.Options;
using UserManagement.Application.Abstractions;
using UserManagement.Application.Configuration;
using UserManagement.Application.DTOs;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Services;
public sealed class AuthVerificationService
{
    private readonly ISessionStore _sessions; private readonly IKeycloakAuthClient _keycloak; private readonly SessionOptions _options;
    public AuthVerificationService(ISessionStore sessions,IKeycloakAuthClient keycloak,IOptions<SessionOptions> options){_sessions=sessions;_keycloak=keycloak;_options=options.Value;}
    public async Task<VerifyTokenResponse> VerifyAsync(string? authorizationHeader,string? sessionId,CancellationToken ct)
    {
        var bearer=ExtractBearer(authorizationHeader); if(string.IsNullOrWhiteSpace(bearer))return new(false,sessionId,null,null,Array.Empty<string>());
        if(!string.IsNullOrWhiteSpace(sessionId)){var cached=await _sessions.GetAsync(sessionId,ct); if(cached is not null && cached.ExpiresAt>DateTimeOffset.UtcNow)return new(true,cached.SessionId,cached.Subject,cached.Username,cached.Roles);}
        var byToken=await _sessions.FindByTokenHashAsync(bearer,ct); if(byToken is not null && byToken.ExpiresAt>DateTimeOffset.UtcNow)return new(true,byToken.SessionId,byToken.Subject,byToken.Username,byToken.Roles);
        var info=await _keycloak.IntrospectAsync(bearer,ct); if(!info.Active||string.IsNullOrWhiteSpace(info.Subject))return new(false,sessionId,null,null,Array.Empty<string>());
        var sid=string.IsNullOrWhiteSpace(sessionId)?Guid.NewGuid().ToString("N"):sessionId; var exp=info.Exp.HasValue?DateTimeOffset.FromUnixTimeSeconds(info.Exp.Value):DateTimeOffset.UtcNow.AddMinutes(_options.TtlMinutes);
        var session=new AuthSession(sid,info.Subject,info.Username??info.Subject,string.Empty,info.Roles.ToArray(),exp,bearer); await _sessions.SaveAsync(session,ct); return new(true,sid,session.Subject,session.Username,session.Roles);
    }
    public Task LogoutAsync(string sessionId,CancellationToken ct)=>_sessions.RemoveAsync(sessionId,ct);
    private static string? ExtractBearer(string? value){const string p="Bearer ";return !string.IsNullOrWhiteSpace(value)&&value.StartsWith(p,StringComparison.OrdinalIgnoreCase)?value[p.Length..].Trim():null;}
}
