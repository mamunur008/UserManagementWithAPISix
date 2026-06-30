using System.Text.Json;
namespace UserManagement.Application.DTOs;

public sealed record MeDto(object Identity, IReadOnlyCollection<string> Roles, IReadOnlyCollection<MenuItemDto> Menus);
// public sealed record UserDto(Guid Id, Guid? KeycloakUserId, string Username, string Email, string? Bio, string? AvatarUrl, string? Phone, Guid? OrganizationId, bool Active, IReadOnlyCollection<string> Roles);
public sealed record UserDto(
    Guid Id,
    Guid? KeycloakUserId,
    string Username,
    string? Email,
    string? FirstName,
    string? LastName,
    string? Bio,
    string? AvatarUrl,
    string? Phone,
    Guid? OrganizationId,
    bool Active,
    IReadOnlyCollection<string> Roles);
public sealed record CreateUserRequest(string Username, string Email, string FirstName, string LastName, Guid? OrganizationId, string? Bio, string? AvatarUrl, string? Phone, string? TemporaryPassword);
public sealed record UpdateUserRequest(string Email, string FirstName, string LastName, string? Bio, string? AvatarUrl, string? Phone, bool Active);
public sealed record RoleDto(Guid Id, Guid? KeycloakRoleId, string Name, string Description, bool IsGlobal, bool IsElevated, IReadOnlyCollection<Guid> AssignableOrgTypeIds);
// public sealed record CreateRoleRequest(string Name, string Description, bool IsGlobal, bool IsElevated, IReadOnlyCollection<Guid> AssignableOrgTypeIds);
public sealed record CreateRoleRequest(
    string Name,
    string? Description,
    bool IsGlobal,
    bool IsElevated,
    IReadOnlyCollection<Guid>? AssignableOrgTypeIds = null);
public sealed record UpdateRoleRequest(string Description, bool IsGlobal, bool IsElevated, bool Active);
// public sealed record PermissionDto(Guid Id, string Name, string? Code, string? Module, string? Description, bool Active);
// public sealed record CreatePermissionRequest(string Name, string? Code, string? Module, string? Description);
public sealed record PermissionDto(
    Guid Id,
    string Key,
    string Code,
    string Module,
    string Name,
    string? Description,
    bool Active);


public sealed record CreatePermissionRequest(
    string Code,
    string Module,
    string? Name,
    string? Description,
    bool Active = true);

public sealed record UpdatePermissionRequest(
    string? Code,
    string? Module,
    string? Name,
    string? Description,
    bool? Active);
public sealed record OrganizationDto(Guid Id, string Name, Guid? TypeId, Guid? ParentId, decimal? CommissionRate, bool Active);


public sealed record UpsertOrganizationRequest(string Name, Guid? TypeId, Guid? ParentId, decimal? CommissionRate, bool Active);
public sealed record OrganizationTypeDto(Guid Id, string Name, string Code);
public sealed record CreateOrganizationTypeRequest(
    string Name,
    string Code);

public sealed record UpdateOrganizationTypeRequest(
    string? Name,
    string? Code);

public sealed record UpsertOrganizationTypeRequest(string Name, string Code);
public sealed record PaymentAccountDto(Guid Id, Guid? OrganizationId, string? Type, string? Holder, JsonDocument? Details, bool IsDefault, bool Active);
public sealed record UpsertPaymentAccountRequest(Guid? OrganizationId, string Type, string Holder, JsonDocument Details, Guid? ChartOfAccountId, bool IsDefault, bool Active);
public sealed record MenuItemDto(Guid Id, string Name, string Url, string Icon, Guid? ParentId, int OrderIndex, bool IsPublic, bool Active, IReadOnlyCollection<Guid> RoleIds);
public sealed record UpsertMenuItemRequest(string Name, string Url, string Icon, Guid? ParentId, int OrderIndex, bool IsPublic, bool Active, IReadOnlyCollection<Guid> RoleIds);
public sealed record AssignRolesRequest(IReadOnlyCollection<Guid> RoleIds);
public sealed record AssignKeycloakRolesRequest(IReadOnlyCollection<Guid> KeycloakRoleIds);
public sealed record AssignPermissionsRequest(IReadOnlyCollection<Guid> PermissionIds);
public sealed record AssignOrgTypesRequest(IReadOnlyCollection<Guid> AssignableOrgTypeIds);
public sealed record MeProfileDto(
    Guid? UserRefId,
    string? Subject,
    string? Username,
    string? Email,
    Guid? OrganizationId,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions);

public sealed record ChartOfAccountDto(
    Guid Id,
    string Code,
    string Name,
    string? Type,
    Guid? ParentId,
    bool Active);

public sealed record CreateChartOfAccountRequest(
    string Code,
    string Name,
    string? Type,
    Guid? ParentId,
    bool Active = true);

public sealed record UpdateChartOfAccountRequest(
    string? Code,
    string? Name,
    string? Type,
    Guid? ParentId,
    bool? Active);