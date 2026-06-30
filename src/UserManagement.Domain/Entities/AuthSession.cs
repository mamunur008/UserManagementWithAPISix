namespace UserManagement.Domain.Entities;

public sealed record AuthSession(string SessionId, string Subject, string Username, string Email, string[] Roles, DateTimeOffset ExpiresAt, string JwtToken);
