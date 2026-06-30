namespace UserManagement.Domain.Entities;

public sealed class ChartOfAccount : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;

    public string? Type { get; set; }
    public Guid? ParentId { get; set; }

    public bool Active { get; set; } = true;
    public bool Voided { get; set; }

    public long? CreatedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public long? DeletedAt { get; set; }

    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }

    public int? ServerVersion { get; set; }

    public ChartOfAccount? Parent { get; set; }
    public ICollection<ChartOfAccount> Children { get; set; } = new List<ChartOfAccount>();
}