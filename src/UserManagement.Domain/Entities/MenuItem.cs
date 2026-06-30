namespace UserManagement.Domain.Entities;

public sealed class MenuItem : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Name { get; set; }
    public string? Url { get; set; }
    public string Icon { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public int OrderIndex { get; set; }
    public bool IsPublic { get; set; }
    public bool Active { get; set; } = true;
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }

    public MenuItem? Parent { get; set; }
    public ICollection<MenuItem> Children { get; set; } = new List<MenuItem>();
    public ICollection<MenuRole> MenuRoles { get; set; } = new List<MenuRole>();
}
