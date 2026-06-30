namespace UserManagement.Domain.Entities;

public sealed class UserRole
{
    public Guid UserRefId { get; set; }
    public Guid RoleId { get; set; }
    public DateTimeOffset? SyncedAt { get; set; }
    public UserRef? UserRef { get; set; }
    public Role? Role { get; set; }
}

/// <summary>Additive join table required for permission-in-role UI.</summary>
public sealed class RolePermission
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }
    public DateTimeOffset? SyncedAt { get; set; }
    public Role? Role { get; set; }
    public Permission? Permission { get; set; }
}

public sealed class RoleOrganizationType
{
    public Guid RoleId { get; set; }
    public Guid OrganizationTypeId { get; set; }
    public Role? Role { get; set; }
    public OrganizationType? OrganizationType { get; set; }
}

public sealed class MenuRole
{
    public Guid MenuItemId { get; set; }
    public Guid RoleId { get; set; }
    public MenuItem? MenuItem { get; set; }
    public Role? Role { get; set; }
}
