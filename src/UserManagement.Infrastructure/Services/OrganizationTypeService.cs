using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Domain.Entities;
using UserManagement.Domain.Errors;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class OrganizationTypeService : IOrganizationTypeService
{
    private readonly UserManagementDbContext _db;

    public OrganizationTypeService(UserManagementDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<OrganizationTypeDto>> GetAllAsync(CancellationToken ct)
    {
        return await _db.OrganizationTypes
            .AsNoTracking()
            .Where(x => !x.Voided)
            .OrderBy(x => x.Name)
            .Select(x => new OrganizationTypeDto(
                x.Id,
                x.Name,
                x.Code
                //, x.Active
                ))
            .ToListAsync(ct);
    }

    public async Task<OrganizationTypeDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.OrganizationTypes
            .AsNoTracking()
            .Where(x => x.Id == id && !x.Voided)
            .Select(x => new OrganizationTypeDto(
                x.Id,
                x.Name,
                x.Code
                // ,x.Active
                ))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<OrganizationTypeDto> CreateAsync(CreateOrganizationTypeRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new AppException("organization_type_name_required", "Organization type name is required.", 422);

        if (string.IsNullOrWhiteSpace(request.Code))
            throw new AppException("organization_type_code_required", "Organization type code is required.", 422);

        var name = request.Name.Trim();
        var code = request.Code.Trim().ToLowerInvariant();

        var exists = await _db.OrganizationTypes
            .AnyAsync(x => !x.Voided && x.Code == code, ct);

        if (exists)
            throw new AppException("organization_type_exists", $"Organization type '{code}' already exists.", 409);

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var organizationType = new OrganizationType
        {
            Id = Guid.NewGuid(),
            Name = name,
            Code = code,
           // Active = request.Active,
            Voided = false,
         //   CreatedAt = now,
         //   ServerVersion = 0
        };

        _db.OrganizationTypes.Add(organizationType);
        await _db.SaveChangesAsync(ct);

        return new OrganizationTypeDto(
            organizationType.Id,
            organizationType.Name,
            organizationType.Code );
    }

    public async Task<OrganizationTypeDto> UpdateAsync(Guid id, UpdateOrganizationTypeRequest request, CancellationToken ct)
    {
        var organizationType = await _db.OrganizationTypes
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("organization_type_not_found", "Organization type not found.", 404);

        if (!string.IsNullOrWhiteSpace(request.Name))
            organizationType.Name = request.Name.Trim();

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var code = request.Code.Trim().ToLowerInvariant();

            var exists = await _db.OrganizationTypes
                .AnyAsync(x => !x.Voided && x.Id != id && x.Code == code, ct);

            if (exists)
                throw new AppException("organization_type_exists", $"Organization type '{code}' already exists.", 409);

            organizationType.Code = code;
        }
         

       // organizationType.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);

        return new OrganizationTypeDto(
            organizationType.Id,
            organizationType.Name,
            organizationType.Code);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var organizationType = await _db.OrganizationTypes
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("organization_type_not_found", "Organization type not found.", 404);

        organizationType.Voided = true;
        // organizationType.DeletedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);
    }
}