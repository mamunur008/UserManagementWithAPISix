namespace UserManagement.Domain.Entities;

public sealed class UserProfile
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? Address { get; set; }
    public string? Gender { get; set; }
    public string? ContactNo { get; set; }
    public string? BloodGroup { get; set; }
    public bool DateOfBirth { get; set; }
    public int? UserId { get; set; }
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public int? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }
    public User? User { get; set; }
}
