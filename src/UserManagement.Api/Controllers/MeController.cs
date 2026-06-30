using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Abstractions;

namespace UserManagement.Api.Controllers;

[ApiController]
[Route("api/me")]
public sealed class MeController : ControllerBase
{
    private readonly ICurrentUserAccessor _current;
    private readonly IMenuService _menu;
    private readonly IMeService _me;

    public MeController(
        ICurrentUserAccessor current,
        IMenuService menu,
        IMeService me)
    {
        _current = current;
        _menu = menu;
        _me = me;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var profile = await _me.GetCurrentUserProfileAsync(ct);
        var menus = await _menu.GetMenuForCurrentUserAsync(ct);

        return Ok(new
        {
            identity = new
            {
                subject = _current.Subject,
                username = _current.Username,
                email = profile.Email,
                userRefId = profile.UserRefId,
                organizationId = profile.OrganizationId
            },
            roles = profile.Roles,
            permissions = profile.Permissions,
            menus
        });
    }
}