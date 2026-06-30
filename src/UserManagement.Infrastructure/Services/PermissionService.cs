using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Application.Mapping;
using UserManagement.Domain.Entities;
using UserManagement.Domain.Errors;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class PermissionService : IPermissionService
{
    private readonly UserManagementDbContext _db;

    public PermissionService(UserManagementDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<PermissionDto>> GetPermissionsAsync(CancellationToken ct)
    {
        var permissions = await _db.Permissions
            .Where(x => !x.Voided)
            .OrderBy(x => x.Module)
            .ThenBy(x => x.Code)
            .ToListAsync(ct);

        return permissions
            .Select(DtoMapper.ToDto)
            .ToList();
    }

    public async Task<PermissionDto?> GetPermissionAsync(Guid id, CancellationToken ct)
    {
        var permission = await _db.Permissions
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct);

        return permission is null ? null : DtoMapper.ToDto(permission);
    }

    public async Task<PermissionDto> CreateAsync(CreatePermissionRequest request, CancellationToken ct)
    {
        var code = NormalizeCode(request.Code);
        var module = NormalizeModule(request.Module);
        var name = string.IsNullOrWhiteSpace(request.Name)
            ? code
            : request.Name.Trim();

        var exists = await _db.Permissions
            .AnyAsync(x => !x.Voided && x.Code == code, ct);

        if (exists)
        {
            throw new AppException(
                "permission_exists",
                $"Permission code '{code}' already exists.",
                409);
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Key = code,
            Code = code,
            Module = module,
            Name = name,
            Description = request.Description,
            Active = request.Active,
            Voided = false,
            CreatedAt = now,
            ServerVersion = 0
        };

        _db.Permissions.Add(permission);
        await _db.SaveChangesAsync(ct);

        return DtoMapper.ToDto(permission);
    }

    public async Task<PermissionDto> UpdateAsync(Guid id, UpdatePermissionRequest request, CancellationToken ct)
    {
        var permission = await _db.Permissions
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("permission_not_found", "Permission not found.", 404);

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var code = NormalizeCode(request.Code);

            var exists = await _db.Permissions
                .AnyAsync(x => x.Id != id && !x.Voided && x.Code == code, ct);

            if (exists)
            {
                throw new AppException(
                    "permission_exists",
                    $"Permission code '{code}' already exists.",
                    409);
            }

            permission.Code = code;
            permission.Key = code;
        }

        if (!string.IsNullOrWhiteSpace(request.Module))
        {
            permission.Module = NormalizeModule(request.Module);
        }

        if (request.Name is not null)
        {
            permission.Name = string.IsNullOrWhiteSpace(request.Name)
                ? permission.Code ?? permission.Key ?? string.Empty
                : request.Name.Trim();
        }

        if (request.Description is not null)
        {
            permission.Description = request.Description;
        }

        if (request.Active.HasValue)
        {
            permission.Active = request.Active.Value;
        }

        permission.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);

        return DtoMapper.ToDto(permission);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var permission = await _db.Permissions
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("permission_not_found", "Permission not found.", 404);

        permission.Voided = true;
        permission.Active = false;
        permission.DeletedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);
    }

    private static string NormalizeCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new AppException("permission_code_required", "Permission code is required.", 422);

        return code.Trim().ToLowerInvariant();
    }

    private static string NormalizeModule(string module)
    {
        if (string.IsNullOrWhiteSpace(module))
            throw new AppException("permission_module_required", "Permission module is required.", 422);

        return module.Trim().ToLowerInvariant();
    }
}