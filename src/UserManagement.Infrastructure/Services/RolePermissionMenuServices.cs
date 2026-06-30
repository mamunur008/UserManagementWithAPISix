using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Application.Mapping;
using UserManagement.Domain.Entities;
using UserManagement.Domain.Errors;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class RolePermissionService : IRolePermissionService
{
    private readonly UserManagementDbContext _db;

    public RolePermissionService(UserManagementDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<PermissionDto>> GetPermissionsByRoleAsync(
        Guid roleId,
        CancellationToken ct)
    {
        var roleExists = await _db.Roles
            .AnyAsync(x => x.Id == roleId && !x.Voided, ct);

        if (!roleExists)
            throw new AppException("role_not_found", "Role not found.", 404);

        var permissions = await (
            from rp in _db.RolePermissions.AsNoTracking()
            join p in _db.Permissions.AsNoTracking()
                on rp.PermissionId equals p.Id
            where rp.RoleId == roleId
                  && !p.Voided
                  && p.Active
            orderby p.Module, p.Code
            select p
        ).ToListAsync(ct);

        return permissions
            .Select(DtoMapper.ToDto)
            .ToList();
    }

    public async Task AssignPermissionsAsync(
        Guid roleId,
        AssignPermissionsRequest request,
        CancellationToken ct)
    {
        await SetPermissionsAsync(roleId, request.PermissionIds, ct);
    }

    public async Task SetPermissionsAsync(
        Guid roleId,
        IReadOnlyCollection<Guid> permissionIds,
        CancellationToken ct)
    {
        var roleExists = await _db.Roles
            .AnyAsync(x => x.Id == roleId && !x.Voided, ct);

        if (!roleExists)
            throw new AppException("role_not_found", "Role not found.", 404);

        var cleanPermissionIds = permissionIds
            .Distinct()
            .ToArray();

        var validPermissionIds = await _db.Permissions
            .Where(x =>
                cleanPermissionIds.Contains(x.Id) &&
                !x.Voided &&
                x.Active)
            .Select(x => x.Id)
            .ToArrayAsync(ct);

        if (validPermissionIds.Length != cleanPermissionIds.Length)
        {
            throw new AppException(
                "permission_not_found",
                "One or more permissions were not found.",
                404);
        }

        var existing = await _db.RolePermissions
            .Where(x => x.RoleId == roleId)
            .ToListAsync(ct);

        _db.RolePermissions.RemoveRange(existing);

        foreach (var permissionId in validPermissionIds)
        {
            _db.RolePermissions.Add(new RolePermission
            {
                RoleId = roleId,
                PermissionId = permissionId
            });
        }

        await _db.SaveChangesAsync(ct);
    }
}

public sealed class MenuService : IMenuService
{
    private readonly UserManagementDbContext _db;
    private readonly ICurrentUserAccessor _current;

    public MenuService(
        UserManagementDbContext db,
        ICurrentUserAccessor current)
    {
        _db = db;
        _current = current;
    }

    public async Task<IReadOnlyCollection<MenuItemDto>> GetAllAsync(CancellationToken ct)
    {
        var menus = await _db.MenuItems
            .AsNoTracking()
            .Where(x => !x.Voided)
            .OrderBy(x => x.OrderIndex)
            .ThenBy(x => x.Name)
            .ToListAsync(ct);

        var menuIds = menus.Select(x => x.Id).ToArray();

        var roleMap = await _db.MenuRoles
            .AsNoTracking()
            .Where(x => menuIds.Contains(x.MenuItemId))
            .GroupBy(x => x.MenuItemId)
            .Select(g => new
            {
                MenuItemId = g.Key,
                RoleIds = g.Select(x => x.RoleId).Distinct().ToArray()
            })
            .ToListAsync(ct);

        var roleLookup = roleMap.ToDictionary(x => x.MenuItemId, x => x.RoleIds);

        return menus
            .Select(x => ToMenuDto(x, roleLookup))
            .ToList();
    }

    public Task<IReadOnlyCollection<MenuItemDto>> GetMenusAsync(CancellationToken ct)
    {
        return GetAllAsync(ct);
    }

    public async Task<IReadOnlyCollection<MenuItemDto>> GetMenusForUserAsync(
        Guid keycloakUserId,
        CancellationToken ct)
    {
        var user = await _db.UserRefs
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.KeycloakUserId == keycloakUserId &&
                x.Active &&
                !x.Voided,
                ct);

        if (user is null)
            return Array.Empty<MenuItemDto>();

        var roleIds = await _db.UserRoles
            .AsNoTracking()
            .Where(x => x.UserRefId == user.Id)
            .Select(x => x.RoleId)
            .Distinct()
            .ToArrayAsync(ct);

        if (roleIds.Length == 0)
            return Array.Empty<MenuItemDto>();

        var menus = await (
            from mi in _db.MenuItems.AsNoTracking()
            join mr in _db.MenuRoles.AsNoTracking()
                on mi.Id equals mr.MenuItemId
            where roleIds.Contains(mr.RoleId)
                  && mi.Active
                  && !mi.Voided
            orderby mi.OrderIndex, mi.Name
            select mi
        )
        .Distinct()
        .ToListAsync(ct);

        var publicMenus = await _db.MenuItems
            .AsNoTracking()
            .Where(x => x.IsPublic && x.Active && !x.Voided)
            .ToListAsync(ct);

        menus = menus
            .Concat(publicMenus)
            .GroupBy(x => x.Id)
            .Select(x => x.First())
            .OrderBy(x => x.OrderIndex)
            .ThenBy(x => x.Name)
            .ToList();

        var menuIds = menus.Select(x => x.Id).ToArray();

        var roleMap = await _db.MenuRoles
            .AsNoTracking()
            .Where(x => menuIds.Contains(x.MenuItemId))
            .GroupBy(x => x.MenuItemId)
            .Select(g => new
            {
                MenuItemId = g.Key,
                RoleIds = g.Select(x => x.RoleId).Distinct().ToArray()
            })
            .ToListAsync(ct);

        var roleLookup = roleMap.ToDictionary(x => x.MenuItemId, x => x.RoleIds);

        return menus
            .Select(x => ToMenuDto(x, roleLookup))
            .ToList();
    }

    public async Task<IReadOnlyCollection<MenuItemDto>> GetMenuForCurrentUserAsync(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_current.Subject))
            return Array.Empty<MenuItemDto>();

        if (!Guid.TryParse(_current.Subject, out var keycloakUserId))
            return Array.Empty<MenuItemDto>();

        return await GetMenusForUserAsync(keycloakUserId, ct);
    }

    public async Task<MenuItemDto> CreateAsync(
        UpsertMenuItemRequest request,
        CancellationToken ct)
    {
        var menu = new MenuItem
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Url = request.Url.Trim(),
            Icon = request.Icon,
            ParentId = request.ParentId,
            OrderIndex = request.OrderIndex,
            IsPublic = request.IsPublic,
            Active = request.Active,
            Voided = false
        };

        _db.MenuItems.Add(menu);

        await UpdateRolesInternalAsync(menu.Id, request.RoleIds ?? Array.Empty<Guid>(), ct);
        await _db.SaveChangesAsync(ct);

        return await GetMenuByIdOrThrowAsync(menu.Id, ct);
    }

    public async Task<MenuItemDto> UpdateAsync(
        Guid id,
        UpsertMenuItemRequest request,
        CancellationToken ct)
    {
        var menu = await _db.MenuItems
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("menu_not_found", "Menu item not found.", 404);

        menu.Name = request.Name.Trim();
        menu.Url = request.Url.Trim();
        menu.Icon = request.Icon;
        menu.ParentId = request.ParentId;
        menu.OrderIndex = request.OrderIndex;
        menu.IsPublic = request.IsPublic;
        menu.Active = request.Active;

        await UpdateRolesInternalAsync(menu.Id, request.RoleIds ?? Array.Empty<Guid>(), ct);
        await _db.SaveChangesAsync(ct);

        return await GetMenuByIdOrThrowAsync(menu.Id, ct);
    }

    public async Task UpdateRolesAsync(
        Guid menuItemId,
        IReadOnlyCollection<Guid> roleIds,
        CancellationToken ct)
    {
        var menuExists = await _db.MenuItems
            .AnyAsync(x => x.Id == menuItemId && !x.Voided, ct);

        if (!menuExists)
            throw new AppException("menu_not_found", "Menu item not found.", 404);

        await UpdateRolesInternalAsync(menuItemId, roleIds, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var menu = await _db.MenuItems
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("menu_not_found", "Menu item not found.", 404);

        menu.Voided = true;
        menu.Active = false;

        await _db.SaveChangesAsync(ct);
    }

    private async Task UpdateRolesInternalAsync(
        Guid menuItemId,
        IReadOnlyCollection<Guid> roleIds,
        CancellationToken ct)
    {
        var existing = await _db.MenuRoles
            .Where(x => x.MenuItemId == menuItemId)
            .ToListAsync(ct);

        _db.MenuRoles.RemoveRange(existing);

        if (roleIds.Count == 0)
            return;

        var cleanRoleIds = roleIds
            .Distinct()
            .ToArray();

        var validRoleIds = await _db.Roles
            .Where(x => cleanRoleIds.Contains(x.Id) && !x.Voided)
            .Select(x => x.Id)
            .ToArrayAsync(ct);

        if (validRoleIds.Length != cleanRoleIds.Length)
        {
            throw new AppException(
                "role_not_found",
                "One or more roles were not found.",
                404);
        }

        foreach (var roleId in validRoleIds)
        {
            _db.MenuRoles.Add(new MenuRole
            {
                MenuItemId = menuItemId,
                RoleId = roleId
            });
        }
    }

    private async Task<MenuItemDto> GetMenuByIdOrThrowAsync(Guid id, CancellationToken ct)
    {
        var menu = await _db.MenuItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("menu_not_found", "Menu item not found.", 404);

        var roleIds = await _db.MenuRoles
            .AsNoTracking()
            .Where(x => x.MenuItemId == id)
            .Select(x => x.RoleId)
            .Distinct()
            .ToArrayAsync(ct);

        return new MenuItemDto(
            menu.Id,
            menu.Name ?? string.Empty,
            menu.Url ?? string.Empty,
            menu.Icon ?? string.Empty,
            menu.ParentId,
            menu.OrderIndex,
            menu.IsPublic,
            menu.Active,
            roleIds);
    }

    private static MenuItemDto ToMenuDto(
        MenuItem menu,
        IReadOnlyDictionary<Guid, Guid[]> roleLookup)
    {
        roleLookup.TryGetValue(menu.Id, out var roleIds);

        return new MenuItemDto(
            menu.Id,
            menu.Name ?? string.Empty,
            menu.Url ?? string.Empty,
            menu.Icon ?? string.Empty,
            menu.ParentId,
            menu.OrderIndex,
            menu.IsPublic,
            menu.Active,
            roleIds ?? Array.Empty<Guid>());
    }
}