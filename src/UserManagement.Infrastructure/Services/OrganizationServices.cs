using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Application.Mapping;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class OrganizationService : IOrganizationService
{
    private readonly UserManagementDbContext _db;
    public OrganizationService(UserManagementDbContext db) => _db = db;

    public async Task<IReadOnlyCollection<OrganizationDto>> GetOrganizationsAsync(CancellationToken ct) =>
        await _db.Organizations.Where(x => !x.Voided).OrderBy(x => x.Name).Select(x => x.ToDto()).ToListAsync(ct);

    public async Task<OrganizationDto> CreateOrganizationAsync(UpsertOrganizationRequest r, CancellationToken ct)
    {
        var e = new Organization
        {
            Name = r.Name,
            TypeId = r.TypeId,
            ParentId = r.ParentId,
            CommissionRate = r.CommissionRate,
            Active = r.Active,
            CreatedAt = EpochClock.Now(),
            UpdatedAt = EpochClock.Now(),
            ServerVersion = 0
        };
        _db.Organizations.Add(e);
        await _db.SaveChangesAsync(ct);
        return e.ToDto();
    }

    public async Task<IReadOnlyCollection<OrganizationTypeDto>> GetTypesAsync(CancellationToken ct) =>
        await _db.OrganizationTypes.OrderBy(x => x.Name).Select(x => x.ToDto()).ToListAsync(ct);
}

public sealed class PaymentAccountService : IPaymentAccountService
{
    private readonly UserManagementDbContext _db;
    public PaymentAccountService(UserManagementDbContext db) => _db = db;

    public async Task<IReadOnlyCollection<PaymentAccountDto>> GetAsync(CancellationToken ct) =>
        await _db.PaymentAccounts.Where(x => !x.Voided).OrderBy(x => x.Holder).Select(x => x.ToDto()).ToListAsync(ct);

    public async Task<PaymentAccountDto> CreateAsync(UpsertPaymentAccountRequest r, CancellationToken ct)
    {
        if (r.IsDefault)
        {
            var oldDefaults = await _db.PaymentAccounts.Where(x => x.OrganizationId == r.OrganizationId).ToListAsync(ct);
            foreach (var x in oldDefaults) x.IsDefault = false;
        }
        var e = new PaymentAccount
        {
            OrganizationId = r.OrganizationId,
            Type = r.Type,
            Holder = r.Holder,
            Details = r.Details,
            ChartOfAccountId = r.ChartOfAccountId,
            IsDefault = r.IsDefault,
            Active = r.Active,
            CreatedAt = EpochClock.Now(),
            UpdatedAt = EpochClock.Now(),
            ServerVersion = 0
        };
        _db.PaymentAccounts.Add(e);
        await _db.SaveChangesAsync(ct);
        return e.ToDto();
    }

    public async Task SetDefaultAsync(Guid id, CancellationToken ct)
    {
        var e = await _db.PaymentAccounts.FirstAsync(x => x.Id == id && !x.Voided, ct);
        var list = await _db.PaymentAccounts.Where(x => x.OrganizationId == e.OrganizationId && !x.Voided).ToListAsync(ct);
        foreach (var item in list) item.IsDefault = item.Id == id;
        await _db.SaveChangesAsync(ct);
    }
}
