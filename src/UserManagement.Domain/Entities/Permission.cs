namespace UserManagement.Domain.Entities;

/// <summary>
/// Additive table for Permission management. accounts_db.txt did not include this table;
/// it is required by the UserManagement UI and implemented as public.permission.
/// </summary>
public sealed class Permission : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = default!;
    public string? Code { get; set; }
    public string? Key { get; set; }
    public string? Module { get; set; }
    public string? Description { get; set; }
    public bool Active { get; set; } = true;
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
