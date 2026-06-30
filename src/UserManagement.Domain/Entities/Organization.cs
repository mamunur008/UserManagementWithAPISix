namespace UserManagement.Domain.Entities;

public sealed class Organization : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Name { get; set; }
    public Guid? TypeId { get; set; }
    public Guid? ParentId { get; set; }
    public decimal? CommissionRate { get; set; }
    public bool Active { get; set; } = true;
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }

    public OrganizationType? Type { get; set; }
    public Organization? Parent { get; set; }
    public ICollection<Organization> Children { get; set; } = new List<Organization>();
}
