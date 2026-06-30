using UserManagement.Application.Abstractions;

namespace UserManagement.Infrastructure.Persistence.Repositories;
public sealed class EfUnitOfWork : IUnitOfWork
{
    private readonly UserManagementDbContext _db;
    public EfUnitOfWork(UserManagementDbContext db) => _db = db;
    public Task<int> SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
