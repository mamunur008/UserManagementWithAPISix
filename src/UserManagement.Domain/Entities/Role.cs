namespace UserManagement.Domain.Entities;

public sealed class Role : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? KeycloakRoleId { get; set; }
     public string? NameCache { get; set; }
    public bool IsGlobal { get; set; }
    public bool IsElevated { get; set; }
    public string? Description { get; set; }
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<RoleOrganizationType> AssignableOrgTypes { get; set; } = new List<RoleOrganizationType>();
    public ICollection<MenuRole> MenuRoles { get; set; } = new List<MenuRole>();
}
