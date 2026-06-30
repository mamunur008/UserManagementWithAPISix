namespace UserManagement.Application.DTOs;

public sealed record LoginRequest(string Username, string Password);
public sealed record LoginResponse(string SessionId, string AccessToken, string? RefreshToken, int ExpiresIn, string TokenType, UserProfileDto User);
public sealed record VerifyTokenResponse(bool IsAuthenticated, string? SessionId, string? UserId, string? Username, IReadOnlyCollection<string> Roles);
public sealed record UserProfileDto(string Id, string Username, string? Email, string? FirstName, string? LastName, IReadOnlyCollection<string> Roles);
