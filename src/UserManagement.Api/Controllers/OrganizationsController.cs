using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
namespace UserManagement.Api.Controllers;

[ApiController, Route("api")]
public sealed class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _s; public OrganizationsController(IOrganizationService s) => _s = s;
    [HttpGet("organizations")] public async Task<IActionResult> Get(CancellationToken ct) => Ok(await _s.GetOrganizationsAsync(ct));
    [HttpPost("organizations")] public async Task<IActionResult> Create(UpsertOrganizationRequest r, CancellationToken ct) => Created("", await _s.CreateOrganizationAsync(r, ct));
  //   [HttpGet("organization-types")] public async Task<IActionResult> Types(CancellationToken ct) => Ok(await _s.GetTypesAsync(ct));
}
