using UserManagement.Application.DTOs;

namespace UserManagement.Application.Abstractions;

public interface IKeycloakAuthClient
{
    Task<KeycloakTokenResult> PasswordLoginAsync(string username, string password, CancellationToken ct);
    Task<KeycloakTokenIntrospection> IntrospectAsync(string token, CancellationToken ct);
    Task<UserProfileDto> GetUserInfoAsync(string accessToken, CancellationToken ct);
}

public sealed record KeycloakTokenResult(string AccessToken, string? RefreshToken, int ExpiresIn, string TokenType);
public sealed record KeycloakTokenIntrospection(bool Active, string? Subject, string? Username, IReadOnlyCollection<string> Roles, long? Exp);
