using UserManagement.Application.DTOs;
using UserManagement.Domain.Entities;

namespace UserManagement.Application.Mapping;

public static class DtoMapper
{
    public static UserDto ToDto(this UserRef x) => new(
        x.Id,
        x.KeycloakUserId,
        x.UsernameCache ?? string.Empty,
        x.EmailCache ?? string.Empty,
        x.FirstName,
        x.LastName,
        x.Bio,
        x.AvatarUrl,
        x.Phone,
        x.OrganizationId,
        x.Active,
        x.UserRoles.Select(r => r.Role?.NameCache ?? string.Empty).Where(s => !string.IsNullOrWhiteSpace(s)).ToArray());

    public static RoleDto ToDto(this Role x) => new(
        x.Id,
        x.KeycloakRoleId,
        x.NameCache ?? string.Empty,
        x.Description ?? string.Empty,
        x.IsGlobal,
        x.IsElevated,
        x.AssignableOrgTypes.Select(o => o.OrganizationTypeId).ToArray());

    // public static PermissionDto ToDto(this Permission x) => new(x.Id, x.Name, x.Code, x.Module, x.Description, x.Active);
    public static PermissionDto ToDto(Permission permission)
    => new(
        permission.Id,
        permission.Key ?? permission.Code ?? string.Empty,
        permission.Code ?? permission.Key ?? string.Empty,
        permission.Module ?? string.Empty,
        permission.Name ?? permission.Code ?? permission.Key ?? string.Empty,
        permission.Description,
        permission.Active);
    public static OrganizationDto ToDto(this Organization x) => new(x.Id, x.Name ?? string.Empty, x.TypeId, x.ParentId, x.CommissionRate, x.Active);
    public static OrganizationTypeDto ToDto(this OrganizationType x) => new(x.Id, x.Name ?? string.Empty, x.Code ?? string.Empty);
    public static PaymentAccountDto ToDto(this PaymentAccount x) => new(x.Id, x.OrganizationId, x.Type, x.Holder, x.Details, x.IsDefault, x.Active);
    public static MenuItemDto ToDto(this MenuItem x) => new(x.Id, x.Name ?? string.Empty, x.Url ?? string.Empty, x.Icon ?? string.Empty, x.ParentId, x.OrderIndex, x.IsPublic, x.Active, x.MenuRoles.Select(r => r.RoleId).ToArray());
}
