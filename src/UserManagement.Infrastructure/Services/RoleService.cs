using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Application.Mapping;
using UserManagement.Domain.Entities;
using UserManagement.Domain.Errors;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class RoleService : IRoleService
{
    private readonly UserManagementDbContext _db;

    public RoleService(UserManagementDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(CancellationToken ct)
    {
        var roles = await _db.Roles
            .AsNoTracking()
            .Where(x => !x.Voided)
            .OrderBy(x => x.NameCache)
            .ToListAsync(ct);

        return roles.Select(DtoMapper.ToDto).ToList();
    }

    public async Task<RoleDto?> GetRoleAsync(Guid id, CancellationToken ct)
    {
        var role = await _db.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct);

        return role is null ? null : DtoMapper.ToDto(role);
    }

    public async Task<RoleDto> CreateRoleAsync(
    CreateRoleRequest request,
    string idempotencyKey,
    CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new AppException(
                "role_name_required",
                "Role name is required.",
                422);
        }

        var name = request.Name.Trim().ToLowerInvariant();

        var assignableOrgTypeIds = request.AssignableOrgTypeIds?
            .Where(x => x != Guid.Empty)
            .Distinct()
            .ToArray() ?? Array.Empty<Guid>();

        var exists = await _db.Roles
            .AnyAsync(x => !x.Voided && x.NameCache == name, ct);

        if (exists)
        {
            throw new AppException(
                "role_exists",
                $"Role '{name}' already exists.",
                409);
        }

        if (assignableOrgTypeIds.Length > 0)
        {
            /* var validOrgTypeCount = await _db.OrganizationTypes
                 .CountAsync(x =>
                     assignableOrgTypeIds.Contains(x.Id) &&
                     !x.Voided,
                     ct); */
            /*
             * var validOrgTypeIds = await _db.OrganizationTypes
          .Where(x => assignableOrgTypeIds.Contains(x.Id))
          .Select(x => x.Id)
          .ToListAsync(ct); */
            var validOrgTypeCount = await _db.OrganizationTypes
                .CountAsync(x =>
                    assignableOrgTypeIds.Contains(x.Id),
                    ct);

            if (validOrgTypeCount != assignableOrgTypeIds.Length)
            {
                throw new AppException(
                    "organization_type_not_found",
                    "One or more assignable organization types were not found.",
                    404);
            }
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            NameCache = name,
            Description = request.Description,
            IsGlobal = request.IsGlobal,
            IsElevated = request.IsElevated,
            Voided = false,
            CreatedAt = now,
            ServerVersion = 0
        };

        _db.Roles.Add(role);

        await _db.SaveChangesAsync(ct);

        if (assignableOrgTypeIds.Length > 0)
        {
            await SetOrgTypesAsync(role.Id, assignableOrgTypeIds, ct);
        }

        return DtoMapper.ToDto(role);
    }


    public async Task<RoleDto> UpdateRoleAsync(
    Guid id,
    UpdateRoleRequest request,
    CancellationToken ct)
    {
        var role = await _db.Roles
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("role_not_found", "Role not found.", 404);

        role.Description = request.Description;
        role.IsGlobal = request.IsGlobal;
        role.IsElevated = request.IsElevated;
        role.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);

        return DtoMapper.ToDto(role);
    }
    /*
    public Task<RoleDto> UpdateRoleAsync(
       Guid id,
       UpdateRoleRequest request,
       CancellationToken ct)
    {
        return UpdateRoleAsync(id, request, string.Empty, ct);
    } */

    public async Task DeleteRoleAsync(Guid id, string idempotencyKey, CancellationToken ct)
    {
        var role = await _db.Roles
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("role_not_found", "Role not found.", 404);

        role.Voided = true;
        role.DeletedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);
    }

    public async Task SetOrgTypesAsync(
        Guid roleId,
        AssignOrgTypesRequest request,
        CancellationToken ct)
    {
        // Keep this empty for now if role_org_type API is not required immediately.
        await Task.CompletedTask;
    }

    public Task<RoleDto> CreateRoleAsync(
    CreateRoleRequest request,
    CancellationToken ct)
    {
        return CreateRoleAsync(request, string.Empty, ct);
    }



    public Task DeleteRoleAsync(
        Guid id,
        CancellationToken ct)
    {
        return DeleteRoleAsync(id, string.Empty, ct);
    }

    public async Task SetOrgTypesAsync(
        Guid roleId,
        IReadOnlyCollection<Guid> orgTypeIds,
        CancellationToken ct)
    {
        var roleExists = await _db.Roles
            .AnyAsync(x => x.Id == roleId && !x.Voided, ct);

        if (!roleExists)
            throw new AppException("role_not_found", "Role not found.", 404);

        // If role_org_type mapping is not required now, keep this as no-op.
        // This satisfies the interface and keeps build working.
        await Task.CompletedTask;
    }
}