using Microsoft.EntityFrameworkCore;
using UserManagement.Domain.Entities;

namespace UserManagement.Infrastructure.Persistence;

public sealed class UserManagementDbContext : DbContext
{
    public UserManagementDbContext(DbContextOptions<UserManagementDbContext> options) : base(options) { }

    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<ChartOfAccount> ChartOfAccounts => Set<ChartOfAccount>(); 
    public DbSet<UserRef> UserRefs => Set<UserRef>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RoleOrganizationType> RoleOrganizationTypes => Set<RoleOrganizationType>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<OrganizationType> OrganizationTypes => Set<OrganizationType>();
    public DbSet<PaymentAccount> PaymentAccounts => Set<PaymentAccount>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<MenuRole> MenuRoles => Set<MenuRole>();
    public DbSet<SagaLog> SagaLogs => Set<SagaLog>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema("public");

        b.Entity<ApiKey>(e =>
        {
            e.ToTable("api_key");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").HasMaxLength(255);
            e.Property(x => x.AccountId).HasColumnName("account_id");
            e.Property(x => x.Key).HasColumnName("api_key").HasMaxLength(1000);
            e.Property(x => x.RevokeReason).HasColumnName("revoke_reason").HasMaxLength(255);
            MapStringAudit(e);
        });

        b.Entity<User>(e =>
        {
            e.ToTable("user");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").ValueGeneratedOnAdd();
            e.Property(x => x.UserName).HasColumnName("user_name").HasMaxLength(255);
            e.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(255);
            e.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(255);
            e.Property(x => x.Email).HasColumnName("email").HasMaxLength(255);
            e.Property(x => x.IsSuperuser).HasColumnName("is_superuser");
            e.Property(x => x.AuthToken).HasColumnName("auth_token").HasMaxLength(255);
            e.Property(x => x.RefreshToken).HasColumnName("refresh_token").HasMaxLength(255);
            e.Property(x => x.Password).HasColumnName("password").HasMaxLength(255);
            e.Property(x => x.LastLogin).HasColumnName("last_login");
            e.Property(x => x.FbToken).HasColumnName("fb_token").HasMaxLength(255);
            e.Property(x => x.IsActive).HasColumnName("is_active");
            e.Property(x => x.PasswordToken).HasColumnName("password_token").HasMaxLength(255);
            e.Property(x => x.PasswordTokenExpired).HasColumnName("password_token_expired");
            MapStringAudit(e);
        });

        b.Entity<UserProfile>(e =>
        {
            e.ToTable("user_profile");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id").HasMaxLength(255);
            e.Property(x => x.Address).HasColumnName("address").HasMaxLength(255);
            e.Property(x => x.Gender).HasColumnName("gender").HasMaxLength(255);
            e.Property(x => x.ContactNo).HasColumnName("contact_no").HasMaxLength(255);
            e.Property(x => x.BloodGroup).HasColumnName("blood_group").HasMaxLength(255);
            e.Property(x => x.DateOfBirth).HasColumnName("date_of_birth");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.Voided).HasColumnName("voided");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.Property(x => x.CreatedBy).HasColumnName("created_by");
            e.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            e.Property(x => x.DeletedBy).HasColumnName("deleted_by");
            e.Property(x => x.ServerVersion).HasColumnName("server_version");
            e.HasOne(x => x.User).WithOne(x => x.Profile).HasForeignKey<UserProfile>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<UserRef>(e =>
        {
            e.ToTable("user_ref");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.KeycloakUserId).HasColumnName("keycloak_user_id");
            e.Property(x => x.UsernameCache).HasColumnName("username_cache").HasMaxLength(160);
            e.Property(x => x.EmailCache).HasColumnName("email_cache").HasMaxLength(254);
            e.Property(x => x.FirstName).HasColumnName("first_name");
            e.Property(x => x.LastName).HasColumnName("last_name");
            e.Property(x => x.OrganizationId).HasColumnName("organization_id");
            e.Property(x => x.Bio).HasColumnName("bio");
            e.Property(x => x.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(512);
            e.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(40);
            e.Property(x => x.Active).HasColumnName("active");
            MapGuidAudit(e);
            e.HasIndex(x => x.KeycloakUserId).IsUnique();
            e.HasOne(x => x.Organization).WithMany().HasForeignKey(x => x.OrganizationId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Role>(e =>
        {
            e.ToTable("role");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.KeycloakRoleId).HasColumnName("keycloak_role_id");
            e.Property(x => x.NameCache).HasColumnName("name_cache").HasMaxLength(120);
            e.Property(x => x.IsGlobal).HasColumnName("is_global");
            e.Property(x => x.IsElevated).HasColumnName("is_elevated");
            e.Property(x => x.Description).HasColumnName("description").HasMaxLength(400);
            MapGuidAudit(e);
            e.HasIndex(x => x.NameCache).IsUnique();
        });

        b.Entity<Permission>(e =>
        {
            e.ToTable("permission");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(160);
            e.Property(x => x.Key).HasColumnName("key").HasMaxLength(180);
            e.Property(x => x.Code).HasColumnName("code").HasMaxLength(180);
            e.Property(x => x.Module).HasColumnName("module").HasMaxLength(80);
            e.Property(x => x.Description).HasColumnName("description").HasMaxLength(400);
            e.Property(x => x.Active).HasColumnName("active");

            /* e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Active).HasColumnName("active");
            e.Property(x => x.Voided).HasColumnName("voided");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            e.Property(x => x.CreatedBy).HasColumnName("created_by");
            e.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            e.Property(x => x.DeletedBy).HasColumnName("deleted_by");
            e.Property(x => x.ServerVersion).HasColumnName("server_version"); */

            MapGuidAudit(e);
            e.HasIndex(x => x.Code).IsUnique();
        });

        b.Entity<UserRole>(e =>
        {
            e.ToTable("user_role");
            e.HasKey(x => new { x.UserRefId, x.RoleId });
            e.Property(x => x.UserRefId).HasColumnName("user_ref_id");
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.Property(x => x.SyncedAt).HasColumnName("synced_at");
            e.HasOne(x => x.UserRef).WithMany(x => x.UserRoles).HasForeignKey(x => x.UserRefId);
            e.HasOne(x => x.Role).WithMany(x => x.UserRoles).HasForeignKey(x => x.RoleId);
        });

        b.Entity<RolePermission>(e =>
        {
            e.ToTable("role_permission");
            e.HasKey(x => new { x.RoleId, x.PermissionId });
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.Property(x => x.PermissionId).HasColumnName("permission_id");
            e.Property(x => x.SyncedAt).HasColumnName("synced_at");
            e.HasOne(x => x.Role).WithMany(x => x.RolePermissions).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.Permission).WithMany(x => x.RolePermissions).HasForeignKey(x => x.PermissionId);
        });

        b.Entity<RoleOrganizationType>(e =>
        {
            e.ToTable("role_org_type");
            e.HasKey(x => new { x.RoleId, x.OrganizationTypeId });
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.Property(x => x.OrganizationTypeId).HasColumnName("organization_type_id");
            e.HasOne(x => x.Role).WithMany(x => x.AssignableOrgTypes).HasForeignKey(x => x.RoleId);
            e.HasOne(x => x.OrganizationType).WithMany(x => x.RoleOrgTypes).HasForeignKey(x => x.OrganizationTypeId);
        });

        b.Entity<Organization>(e =>
        {
            e.ToTable("organization");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(160);
            e.Property(x => x.TypeId).HasColumnName("type_id");
            e.Property(x => x.ParentId).HasColumnName("parent_id");
            e.Property(x => x.CommissionRate).HasColumnName("commission_rate").HasPrecision(5, 2);
            e.Property(x => x.Active).HasColumnName("active");
            MapGuidAudit(e);
            e.HasOne(x => x.Type).WithMany().HasForeignKey(x => x.TypeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Parent).WithMany(x => x.Children).HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<OrganizationType>(e =>
        {
            e.ToTable("organization_type");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(80);
            e.Property(x => x.Code).HasColumnName("code").HasMaxLength(40);
            e.Property(x => x.Voided).HasColumnName("voided").HasMaxLength(40);
        });

        b.Entity<PaymentAccount>(e =>
        {
            e.ToTable("payment_account");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OrganizationId).HasColumnName("organization_id");
            e.Property(x => x.Type).HasColumnName("type").HasMaxLength(16);
            e.Property(x => x.Holder).HasColumnName("holder").HasMaxLength(160);
            e.Property(x => x.Details).HasColumnName("details").HasColumnType("jsonb");
            e.Property(x => x.ChartOfAccountId).HasColumnName("chart_of_account_id");
            e.Property(x => x.IsDefault).HasColumnName("is_default");
            e.Property(x => x.Active).HasColumnName("active");
            MapGuidAudit(e);
            e.HasOne(x => x.Organization).WithMany().HasForeignKey(x => x.OrganizationId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<MenuItem>(e =>
        {
            e.ToTable("menu_item");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Name).HasColumnName("name").HasMaxLength(120);
            e.Property(x => x.Url).HasColumnName("url").HasMaxLength(400);
            e.Property(x => x.Icon).HasColumnName("icon").HasMaxLength(80);
            e.Property(x => x.ParentId).HasColumnName("parent_id");
            e.Property(x => x.OrderIndex).HasColumnName("order_index");
            e.Property(x => x.IsPublic).HasColumnName("is_public");
            e.Property(x => x.Active).HasColumnName("active");
            MapGuidAudit(e);
            e.HasOne(x => x.Parent).WithMany(x => x.Children).HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<MenuRole>(e =>
        {
            e.ToTable("menu_role");
            e.HasKey(x => new { x.MenuItemId, x.RoleId });
            e.Property(x => x.MenuItemId).HasColumnName("menu_item_id");
            e.Property(x => x.RoleId).HasColumnName("role_id");
            e.HasOne(x => x.MenuItem).WithMany(x => x.MenuRoles).HasForeignKey(x => x.MenuItemId);
            e.HasOne(x => x.Role).WithMany(x => x.MenuRoles).HasForeignKey(x => x.RoleId);
        });

        b.Entity<SagaLog>(e =>
        {
            e.ToTable("saga_log");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Operation).HasColumnName("operation").HasMaxLength(40);
            e.Property(x => x.State).HasColumnName("state").HasMaxLength(16);
            e.Property(x => x.IdempotencyKey).HasColumnName("idempotency_key").HasMaxLength(120);
            e.Property(x => x.TargetRef).HasColumnName("target_ref").HasMaxLength(160);
            e.Property(x => x.Payload).HasColumnName("payload").HasColumnType("jsonb");
            e.Property(x => x.Attempts).HasColumnName("attempts");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.IdempotencyKey).IsUnique();
            e.HasIndex(x => new { x.Operation, x.State, x.UpdatedAt }).HasDatabaseName("ix_saga_state");
        });

        b.Entity<ChartOfAccount>(entity =>
        {
            entity.ToTable("chart_of_account");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Id)
                .HasColumnName("id");

            entity.Property(x => x.Code)
                .HasColumnName("code")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Name)
                .HasColumnName("name")
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Type)
                .HasColumnName("type")
                .HasMaxLength(100);

            entity.Property(x => x.ParentId)
                .HasColumnName("parent_id");

            entity.Property(x => x.Active)
                .HasColumnName("active");

            entity.Property(x => x.Voided)
                .HasColumnName("voided");

            entity.Property(x => x.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at");

            entity.Property(x => x.DeletedAt)
                .HasColumnName("deleted_at");

            entity.Property(x => x.CreatedBy)
                .HasColumnName("created_by");

            entity.Property(x => x.UpdatedBy)
                .HasColumnName("updated_by");

            entity.Property(x => x.DeletedBy)
                .HasColumnName("deleted_by");

            entity.Property(x => x.ServerVersion)
                .HasColumnName("server_version");

            entity.HasIndex(x => x.Code)
                .IsUnique()
                .HasFilter("voided = false");

            entity.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void MapGuidAudit<T>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<T> e) where T : class, IBigIntAudit
    {
        e.Property(x => x.Voided).HasColumnName("voided");
        e.Property(x => x.CreatedAt).HasColumnName("created_at");
        e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        e.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        e.Property(x => x.ServerVersion).HasColumnName("server_version");
        e.Property("CreatedBy").HasColumnName("created_by");
        e.Property("UpdatedBy").HasColumnName("updated_by");
        e.Property("DeletedBy").HasColumnName("deleted_by");
    }

    private static void MapStringAudit(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<ApiKey> e)
    {
        e.Property(x => x.Voided).HasColumnName("voided");
        e.Property(x => x.CreatedAt).HasColumnName("created_at");
        e.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        e.Property(x => x.CreatedBy).HasColumnName("created_by");
        e.Property(x => x.UpdatedBy).HasColumnName("updated_by");
        e.Property(x => x.DeletedBy).HasColumnName("deleted_by");
        e.Property(x => x.ServerVersion).HasColumnName("server_version");
    }

    private static void MapStringAudit(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<User> e)
    {
        e.Property(x => x.Voided).HasColumnName("voided");
        e.Property(x => x.CreatedAt).HasColumnName("created_at");
        e.Property(x => x.DeletedAt).HasColumnName("deleted_at");
        e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        e.Property(x => x.CreatedBy).HasColumnName("created_by").HasMaxLength(255);
        e.Property(x => x.UpdatedBy).HasColumnName("updated_by").HasMaxLength(255);
        e.Property(x => x.DeletedBy).HasColumnName("deleted_by").HasMaxLength(255);
        e.Property(x => x.ServerVersion).HasColumnName("server_version");
    }
}
