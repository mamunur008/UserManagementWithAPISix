using UserManagement.Application.DTOs;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Abstractions;

// public interface ICurrentUserAccessor { string? Subject { get; } string? Username { get; } string[] Roles { get; } }
public interface ICurrentUserAccessor
{
    string? Subject { get; }
    string? UserId { get; }
    string? Username { get; }
    string[] Roles { get; }
    string[] Permissions { get; }
}
public interface ISessionStore { Task<AuthSession?> GetAsync(string sessionId, CancellationToken ct); Task<AuthSession?> FindByTokenHashAsync(string accessToken, CancellationToken ct); Task SaveAsync(AuthSession session, CancellationToken ct); Task RemoveAsync(string sessionId, CancellationToken ct); }
public interface ITokenValidationService { Task<AuthSession> ValidateAndCacheAsync(string token, string? sessionId, CancellationToken ct); }
public interface IKeycloakAdminClient { Task<string> CreateUserAsync(CreateUserRequest request, CancellationToken ct); Task UpdateUserAsync(string keycloakUserId, UpdateUserRequest request, CancellationToken ct); Task DeleteUserAsync(string keycloakUserId, CancellationToken ct); Task<string> CreateRealmRoleAsync(string name, string description, CancellationToken ct); Task DeleteRealmRoleAsync(string keycloakRoleId, CancellationToken ct); Task SetUserRealmRolesAsync(string keycloakUserId, IReadOnlyCollection<string> keycloakRoleIds, CancellationToken ct); Task SetRoleCompositesAsync(string roleName, IReadOnlyCollection<string> permissionRoleNames, CancellationToken ct); }
public interface IUnitOfWork { Task<int> SaveChangesAsync(CancellationToken ct); }
public interface IUserService { Task<IReadOnlyCollection<UserDto>> GetUsersAsync(CancellationToken ct); Task<UserDto?> GetUserAsync(Guid id, CancellationToken ct); Task<UserDto> CreateUserAsync(CreateUserRequest request, string idempotencyKey, CancellationToken ct); Task UpdateUserAsync(Guid id, UpdateUserRequest request, string idempotencyKey, CancellationToken ct); Task DeactivateUserAsync(Guid id, string idempotencyKey, CancellationToken ct); Task<IReadOnlyCollection<RoleDto>> GetRolesByUserAsync(Guid userId, CancellationToken ct); Task SetUserRolesAsync(Guid userId, IReadOnlyCollection<Guid> roleIds, string idempotencyKey, CancellationToken ct); }
// public interface IRoleService { Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(CancellationToken ct); Task<RoleDto?> GetRoleAsync(Guid id, CancellationToken ct); Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, CancellationToken ct); Task UpdateRoleAsync(Guid id, UpdateRoleRequest request, CancellationToken ct); Task DeleteRoleAsync(Guid id, CancellationToken ct); Task SetOrgTypesAsync(Guid roleId, IReadOnlyCollection<Guid> orgTypeIds, CancellationToken ct); }
public interface IRoleService
{
    Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(CancellationToken ct);
    Task<RoleDto?> GetRoleAsync(Guid id, CancellationToken ct);
    Task<RoleDto> CreateRoleAsync(CreateRoleRequest request, CancellationToken ct);
    Task<RoleDto> UpdateRoleAsync(Guid id, UpdateRoleRequest request, CancellationToken ct);
    Task DeleteRoleAsync(Guid id, CancellationToken ct);
    Task SetOrgTypesAsync(Guid roleId, IReadOnlyCollection<Guid> orgTypeIds, CancellationToken ct);
}
// public interface IPermissionService { Task<IReadOnlyCollection<PermissionDto>> GetPermissionsAsync(CancellationToken ct); Task<PermissionDto> CreatePermissionAsync(CreatePermissionRequest request, CancellationToken ct); }
public interface IPermissionService
{
    Task<IReadOnlyCollection<PermissionDto>> GetPermissionsAsync(CancellationToken ct);
    Task<PermissionDto?> GetPermissionAsync(Guid id, CancellationToken ct);
    Task<PermissionDto> CreateAsync(CreatePermissionRequest request, CancellationToken ct);
    Task<PermissionDto> UpdateAsync(Guid id, UpdatePermissionRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
public interface IRolePermissionService { Task<IReadOnlyCollection<PermissionDto>> GetPermissionsByRoleAsync(Guid roleId, CancellationToken ct); Task SetPermissionsAsync(Guid roleId, IReadOnlyCollection<Guid> permissionIds, CancellationToken ct); }
public interface IMenuService { Task<IReadOnlyCollection<MenuItemDto>> GetMenuForCurrentUserAsync(CancellationToken ct); Task<IReadOnlyCollection<MenuItemDto>> GetAllAsync(CancellationToken ct); Task<MenuItemDto> CreateAsync(UpsertMenuItemRequest request, CancellationToken ct); Task UpdateRolesAsync(Guid menuItemId, IReadOnlyCollection<Guid> roleIds, CancellationToken ct); }
public interface IOrganizationService { Task<IReadOnlyCollection<OrganizationDto>> GetOrganizationsAsync(CancellationToken ct); Task<OrganizationDto> CreateOrganizationAsync(UpsertOrganizationRequest request, CancellationToken ct); Task<IReadOnlyCollection<OrganizationTypeDto>> GetTypesAsync(CancellationToken ct); }
public interface IPaymentAccountService { Task<IReadOnlyCollection<PaymentAccountDto>> GetAsync(CancellationToken ct); Task<PaymentAccountDto> CreateAsync(UpsertPaymentAccountRequest request, CancellationToken ct); Task SetDefaultAsync(Guid id, CancellationToken ct); }

public interface IMeService
{
    Task<MeProfileDto> GetCurrentUserProfileAsync(CancellationToken ct);
}
public interface IOrganizationTypeService
{
    Task<IReadOnlyCollection<OrganizationTypeDto>> GetAllAsync(CancellationToken ct);
    Task<OrganizationTypeDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<OrganizationTypeDto> CreateAsync(CreateOrganizationTypeRequest request, CancellationToken ct);
    Task<OrganizationTypeDto> UpdateAsync(Guid id, UpdateOrganizationTypeRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

