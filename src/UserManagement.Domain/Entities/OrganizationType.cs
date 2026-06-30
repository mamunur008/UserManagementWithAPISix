namespace UserManagement.Domain.Entities;

public sealed class OrganizationType
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Name { get; set; }
    public string? Code { get; set; }
    public bool Voided { get; set; } = false;
    // public string NameCache { get; set; } = string.Empty;
    public ICollection<RoleOrganizationType> RoleOrgTypes { get; set; } = new List<RoleOrganizationType>();
}
