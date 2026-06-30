namespace UserManagement.Domain.Entities;

/// <summary>
/// Legacy/local admin user table from accounts_db.sql: public."user".
/// Keycloak-backed application users are stored in UserRef/public.user_ref.
/// </summary>
public sealed class User
{
    public int Id { get; set; }
    public string? UserName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public bool IsSuperuser { get; set; }
    public string? AuthToken { get; set; }
    public string? RefreshToken { get; set; }
    public string? Password { get; set; }
    public long? LastLogin { get; set; }
    public string? FbToken { get; set; }
    public bool? IsActive { get; set; }
    public string? PasswordToken { get; set; }
    public long? PasswordTokenExpired { get; set; }
    public bool Voided { get; set; }
    public long? CreatedAt { get; set; }
    public long? DeletedAt { get; set; }
    public long? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public string? DeletedBy { get; set; }
    public int? ServerVersion { get; set; }
    public UserProfile? Profile { get; set; }
}
