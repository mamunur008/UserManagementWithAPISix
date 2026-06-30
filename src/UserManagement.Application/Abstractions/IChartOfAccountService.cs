using UserManagement.Application.DTOs;

namespace UserManagement.Application.Abstractions;

public interface IChartOfAccountService
{
    Task<IReadOnlyCollection<ChartOfAccountDto>> GetAllAsync(CancellationToken ct);
    Task<ChartOfAccountDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ChartOfAccountDto> CreateAsync(CreateChartOfAccountRequest request, CancellationToken ct);
    Task<ChartOfAccountDto> UpdateAsync(Guid id, UpdateChartOfAccountRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}