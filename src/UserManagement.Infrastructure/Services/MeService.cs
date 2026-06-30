using Microsoft.EntityFrameworkCore;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
using UserManagement.Infrastructure.Persistence;

namespace UserManagement.Infrastructure.Services;

public sealed class MeService : IMeService
{
    private readonly UserManagementDbContext _db;
    private readonly ICurrentUserAccessor _current;

    public MeService(UserManagementDbContext db, ICurrentUserAccessor current)
    {
        _db = db;
        _current = current;
    }

    public async Task<MeProfileDto> GetCurrentUserProfileAsync(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_current.Subject) ||
            !Guid.TryParse(_current.Subject, out var keycloakUserId))
        {
            return Empty();
        }

        var user = await _db.UserRefs
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.KeycloakUserId == keycloakUserId &&
                x.Active &&
                !x.Voided,
                ct);

        if (user is null)
        {
            return Empty();
        }

        var roles = await (
            from ur in _db.UserRoles.AsNoTracking()
            join r in _db.Roles.AsNoTracking()
                on ur.RoleId equals r.Id
            where ur.UserRefId == user.Id
                  && !r.Voided
            orderby r.NameCache
            select r.NameCache
        )
        .Distinct()
        .ToListAsync(ct);

        var permissions = await (
            from ur in _db.UserRoles.AsNoTracking()
            join r in _db.Roles.AsNoTracking()
                on ur.RoleId equals r.Id
            join rp in _db.RolePermissions.AsNoTracking()
                on r.Id equals rp.RoleId
            join p in _db.Permissions.AsNoTracking()
                on rp.PermissionId equals p.Id
            where ur.UserRefId == user.Id
                  && !r.Voided
                  && !p.Voided
                  && p.Active
            orderby p.Module, p.Code
            select p.Code ?? p.Key ?? p.Name
        )
        .Distinct()
        .ToListAsync(ct);

        return new MeProfileDto(
            user.Id,
            keycloakUserId.ToString(),
            user.UsernameCache,
            user.EmailCache,
            user.OrganizationId,
            roles,
            permissions);
    }

    private MeProfileDto Empty()
        => new(
            null,
            _current.Subject,
            _current.Username,
            null,
            null,
            Array.Empty<string>(),
            Array.Empty<string>());
}