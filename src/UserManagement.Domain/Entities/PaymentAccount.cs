using System.Text.Json;

namespace UserManagement.Domain.Entities;

public sealed class PaymentAccount : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? OrganizationId { get; set; }
    public string? Type { get; set; }
    public string? Holder { get; set; }
    public JsonDocument? Details { get; set; }
    public Guid? ChartOfAccountId { get; set; }
    public bool IsDefault { get; set; }
    public bool Active { get; set; } = true;
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }
    public Guid? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }

    public Organization? Organization { get; set; }
}
