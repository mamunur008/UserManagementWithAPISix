namespace UserManagement.Domain.Entities;

public sealed class ApiKey
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public long? AccountId { get; set; }
    public string? Key { get; set; }
    public string? RevokeReason { get; set; }
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public string? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }
}
