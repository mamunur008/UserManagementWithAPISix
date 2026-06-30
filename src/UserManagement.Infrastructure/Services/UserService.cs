using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Application.Mapping;
using UserManagement.Domain.Entities;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

/// <summary>
/// Orchestrates user write-through between Keycloak and local user_ref using saga_log.
/// Controller calls only this service; business logic stays here.
/// </summary>
public sealed class UserService : IUserService
{
    private readonly UserManagementDbContext _db;
    private readonly IKeycloakAdminClient _keycloak;

    public UserService(UserManagementDbContext db, IKeycloakAdminClient keycloak)
    {
        _db = db;
        _keycloak = keycloak;
    }

    public async Task<IReadOnlyCollection<UserDto>> GetUsersAsync(CancellationToken ct) =>
        await _db.UserRefs
            .Include(x => x.UserRoles).ThenInclude(x => x.Role)
            .Where(x => !x.Voided)
            .OrderBy(x => x.UsernameCache)
            .Select(x => x.ToDto())
            .ToListAsync(ct);

    public async Task<UserDto?> GetUserAsync(Guid id, CancellationToken ct) =>
        (await _db.UserRefs.Include(x => x.UserRoles).ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id && !x.Voided, ct))?.ToDto();

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request, string idempotencyKey, CancellationToken ct)
    {
        var existingSaga = await _db.SagaLogs.FirstOrDefaultAsync(x => x.IdempotencyKey == idempotencyKey, ct);
        if (existingSaga?.State == SagaStates.Committed && Guid.TryParse(existingSaga.TargetRef, out var existingKcId))
        {
            var existing = await _db.UserRefs.FirstOrDefaultAsync(x => x.KeycloakUserId == existingKcId, ct);
            if (existing is not null) return existing.ToDto();
        }

        var localId = Guid.NewGuid();
        var saga = SagaLog.Start(SagaOperations.CreateUser, idempotencyKey, new { request.Username, request.Email, request.OrganizationId, localId });
        _db.SagaLogs.Add(saga);
        await _db.SaveChangesAsync(ct);

        string? kcIdText = null;
        try
        {
            kcIdText = await RetryAsync(() => _keycloak.CreateUserAsync(request, ct), saga, ct);
            var kcId = Guid.Parse(kcIdText);

            var entity = new UserRef
            {
                Id = localId,
                KeycloakUserId = kcId,
                UsernameCache = request.Username,
                EmailCache = request.Email,
                OrganizationId = request.OrganizationId,
                Bio = request.Bio,
                AvatarUrl = request.AvatarUrl,
                Phone = request.Phone,
                Active = true,
                Voided = false,
                CreatedAt = EpochClock.Now(),
                UpdatedAt = EpochClock.Now(),
                ServerVersion = 0
            };

            _db.UserRefs.Add(entity);
            saga.State = SagaStates.Committed;
            saga.TargetRef = kcId.ToString();
            saga.Payload = JsonSerializer.SerializeToDocument(new { result = localId, localId, username = request.Username, request.OrganizationId });
            saga.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(ct);

            return (await GetUserAsync(entity.Id, ct))!;
        }
        catch (Exception)
        {
            saga.State = SagaStates.Aborted;
            saga.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(ct);

            if (!string.IsNullOrWhiteSpace(kcIdText))
            {
                try
                {
                    await _keycloak.DeleteUserAsync(kcIdText, ct);
                    saga.State = SagaStates.Compensated;
                    saga.UpdatedAt = DateTimeOffset.UtcNow;
                    await _db.SaveChangesAsync(ct);
                }
                catch { /* compensation failure is visible in saga_log attempts/state */ }
            }

            throw;
        }
    }

    public async Task UpdateUserAsync(Guid id, UpdateUserRequest request, string idempotencyKey, CancellationToken ct)
    {
        var user = await _db.UserRefs.FirstAsync(x => x.Id == id && !x.Voided, ct);
        var saga = SagaLog.Start(SagaOperations.UpdateUser, idempotencyKey, new { userRefId = id, request });
        _db.SagaLogs.Add(saga);
        await _db.SaveChangesAsync(ct);

        await RetryAsync(() => _keycloak.UpdateUserAsync(user.KeycloakUserId!.Value.ToString(), request, ct), saga, ct);

        user.EmailCache = request.Email;
        user.Bio = request.Bio;
        user.AvatarUrl = request.AvatarUrl;
        user.Phone = request.Phone;
        user.Active = request.Active;
        user.UpdatedAt = EpochClock.Now();
        saga.State = SagaStates.Committed;
        saga.TargetRef = user.KeycloakUserId?.ToString();
        saga.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeactivateUserAsync(Guid id, string idempotencyKey, CancellationToken ct)
    {
        var user = await _db.UserRefs.FirstAsync(x => x.Id == id && !x.Voided, ct);
        user.Active = false;
        user.UpdatedAt = EpochClock.Now();
        _db.SagaLogs.Add(new SagaLog
        {
            Operation = SagaOperations.DeactivateUser,
            State = SagaStates.Committed,
            IdempotencyKey = idempotencyKey,
            TargetRef = user.KeycloakUserId?.ToString(),
            Payload = JsonSerializer.SerializeToDocument(new { userRefId = id }),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyCollection<RoleDto>> GetRolesByUserAsync(Guid userId, CancellationToken ct) =>
        await _db.UserRoles
            .Where(x => x.UserRefId == userId)
            .Include(x => x.Role).ThenInclude(r => r!.AssignableOrgTypes)
            .Select(x => x.Role!.ToDto())
            .ToListAsync(ct);

    public async Task SetUserRolesAsync(Guid userId, IReadOnlyCollection<Guid> roleIds, string idempotencyKey, CancellationToken ct)
    {
        var user = await _db.UserRefs.FirstAsync(x => x.Id == userId && !x.Voided, ct);
        var roles = await _db.Roles.Where(x => roleIds.Contains(x.Id) && !x.Voided).ToListAsync(ct);
        var kcRoleIds = roles.Where(x => x.KeycloakRoleId.HasValue).Select(x => x.KeycloakRoleId!.Value.ToString()).ToArray();

        var saga = SagaLog.Start(SagaOperations.AssignRole, idempotencyKey, new { userId, roleIds });
        _db.SagaLogs.Add(saga);
        await _db.SaveChangesAsync(ct);

        await RetryAsync(() => _keycloak.SetUserRealmRolesAsync(user.KeycloakUserId!.Value.ToString(), kcRoleIds, ct), saga, ct);

        _db.UserRoles.RemoveRange(_db.UserRoles.Where(x => x.UserRefId == userId));
        foreach (var role in roles)
            _db.UserRoles.Add(new UserRole { UserRefId = userId, RoleId = role.Id, SyncedAt = DateTimeOffset.UtcNow });

        saga.State = SagaStates.Committed;
        saga.TargetRef = user.KeycloakUserId?.ToString();
        saga.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    private static async Task<T> RetryAsync<T>(Func<Task<T>> action, SagaLog saga, CancellationToken ct)
    {
        Exception? last = null;
        for (var i = 0; i < 3; i++)
        {
            try { return await action(); }
            catch (Exception ex)
            {
                last = ex;
                saga.Attempts++;
                saga.UpdatedAt = DateTimeOffset.UtcNow;
                await Task.Delay(TimeSpan.FromMilliseconds(250 * (i + 1)), ct);
            }
        }
        throw last!;
    }

    private static async Task RetryAsync(Func<Task> action, SagaLog saga, CancellationToken ct) =>
        await RetryAsync(async () => { await action(); return true; }, saga, ct);
}
