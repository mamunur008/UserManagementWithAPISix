using Microsoft.AspNetCore.Mvc; using UserManagement.Application.Abstractions; using UserManagement.Application.DTOs;
namespace UserManagement.Api.Controllers;
[ApiController,Route("api/role-permissions")]
public sealed class RolePermissionsController:ControllerBase
{ private readonly IRolePermissionService _s; public RolePermissionsController(IRolePermissionService s)=>_s=s;
[HttpGet("{roleId:guid}")] public async Task<IActionResult> Get(Guid roleId,CancellationToken ct)=>Ok(await _s.GetPermissionsByRoleAsync(roleId,ct));
[HttpPost("{roleId:guid}")] public async Task<IActionResult> Set(Guid roleId,AssignPermissionsRequest r,CancellationToken ct){await _s.SetPermissionsAsync(roleId,r.PermissionIds,ct);return NoContent();}}
