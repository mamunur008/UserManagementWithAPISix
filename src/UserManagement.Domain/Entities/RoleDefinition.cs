namespace UserManagement.Domain.Entities;

public sealed record RoleDefinition(string Id, string Name, string? Description, bool IsPermission);
