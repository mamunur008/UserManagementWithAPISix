namespace UserManagement.Domain.Entities;

public sealed class UserRef : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? KeycloakUserId { get; set; }

    public string? UsernameCache { get; set; }
    public string? EmailCache { get; set; }

    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public Guid? OrganizationId { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
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
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
public sealed class UserRefOld : IBigIntAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? KeycloakUserId { get; set; }
    public string? UsernameCache { get; set; }
    public string? EmailCache { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
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
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
