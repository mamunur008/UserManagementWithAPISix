using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Domain.Entities;
using UserManagement.Domain.Errors;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class ChartOfAccountService : IChartOfAccountService
{
    private readonly UserManagementDbContext _db;

    public ChartOfAccountService(UserManagementDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<ChartOfAccountDto>> GetAllAsync(CancellationToken ct)
    {
        return await _db.ChartOfAccounts
            .AsNoTracking()
            .Where(x => !x.Voided)
            .OrderBy(x => x.Code)
            .Select(x => new ChartOfAccountDto(
                x.Id,
                x.Code,
                x.Name,
                x.Type,
                x.ParentId,
                x.Active))
            .ToListAsync(ct);
    }

    public async Task<ChartOfAccountDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.ChartOfAccounts
            .AsNoTracking()
            .Where(x => x.Id == id && !x.Voided)
            .Select(x => new ChartOfAccountDto(
                x.Id,
                x.Code,
                x.Name,
                x.Type,
                x.ParentId,
                x.Active))
            .FirstOrDefaultAsync(ct);
    }

    public async Task<ChartOfAccountDto> CreateAsync(CreateChartOfAccountRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            throw new AppException("chart_account_code_required", "Chart of account code is required.", 422);

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new AppException("chart_account_name_required", "Chart of account name is required.", 422);

        var code = request.Code.Trim();
        var name = request.Name.Trim();

        var exists = await _db.ChartOfAccounts
            .AnyAsync(x => !x.Voided && x.Code == code, ct);

        if (exists)
            throw new AppException("chart_account_exists", $"Chart of account '{code}' already exists.", 409);

        if (request.ParentId.HasValue)
        {
            var parentExists = await _db.ChartOfAccounts
                .AnyAsync(x => x.Id == request.ParentId.Value && !x.Voided, ct);

            if (!parentExists)
                throw new AppException("parent_chart_account_not_found", "Parent chart of account not found.", 404);
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var account = new ChartOfAccount
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = name,
            Type = string.IsNullOrWhiteSpace(request.Type) ? null : request.Type.Trim(),
            ParentId = request.ParentId,
            Active = request.Active,
            Voided = false,
            CreatedAt = now,
            ServerVersion = 0
        };

        _db.ChartOfAccounts.Add(account);
        await _db.SaveChangesAsync(ct);

        return ToDto(account);
    }

    public async Task<ChartOfAccountDto> UpdateAsync(Guid id, UpdateChartOfAccountRequest request, CancellationToken ct)
    {
        var account = await _db.ChartOfAccounts
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("chart_account_not_found", "Chart of account not found.", 404);

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var code = request.Code.Trim();

            var exists = await _db.ChartOfAccounts
                .AnyAsync(x => !x.Voided && x.Id != id && x.Code == code, ct);

            if (exists)
                throw new AppException("chart_account_exists", $"Chart of account '{code}' already exists.", 409);

            account.Code = code;
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
            account.Name = request.Name.Trim();

        account.Type = string.IsNullOrWhiteSpace(request.Type)
            ? account.Type
            : request.Type.Trim();

        if (request.ParentId.HasValue)
        {
            if (request.ParentId.Value == id)
                throw new AppException("invalid_parent_chart_account", "A chart account cannot be parent of itself.", 422);

            var parentExists = await _db.ChartOfAccounts
                .AnyAsync(x => x.Id == request.ParentId.Value && !x.Voided, ct);

            if (!parentExists)
                throw new AppException("parent_chart_account_not_found", "Parent chart of account not found.", 404);

            account.ParentId = request.ParentId;
        }

        if (request.Active.HasValue)
            account.Active = request.Active.Value;

        account.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);

        return ToDto(account);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var account = await _db.ChartOfAccounts
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct)
            ?? throw new AppException("chart_account_not_found", "Chart of account not found.", 404);

        var isUsedByPaymentAccount = await _db.PaymentAccounts
            .AnyAsync(x => x.ChartOfAccountId == id && !x.Voided, ct);

        if (isUsedByPaymentAccount)
            throw new AppException("chart_account_in_use", "This chart account is used by a payment account.", 409);

        account.Voided = true;
        account.DeletedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        await _db.SaveChangesAsync(ct);
    }

    private static ChartOfAccountDto ToDto(ChartOfAccount account)
    {
        return new ChartOfAccountDto(
            account.Id,
            account.Code,
            account.Name,
            account.Type,
            account.ParentId,
            account.Active);
    }
}