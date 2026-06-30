using Microsoft.AspNetCore.Mvc; using UserManagement.Application.Abstractions; using UserManagement.Application.DTOs;
namespace UserManagement.Api.Controllers;
[ApiController,Route("api/roles")]
public sealed class RolesController:ControllerBase
{ private readonly IRoleService _s; public RolesController(IRoleService s)=>_s=s;
[HttpGet] public async Task<IActionResult> Get(CancellationToken ct)=>Ok(await _s.GetRolesAsync(ct));
[HttpGet("{id:guid}")] public async Task<IActionResult> Get(Guid id,CancellationToken ct)=>(await _s.GetRoleAsync(id,ct)) is { } r?Ok(r):NotFound();
[HttpPost] public async Task<IActionResult> Create(CreateRoleRequest r,CancellationToken ct)=>Created("",await _s.CreateRoleAsync(r,ct));
[HttpPut("{id:guid}")] public async Task<IActionResult> Update(Guid id,UpdateRoleRequest r,CancellationToken ct){await _s.UpdateRoleAsync(id,r,ct);return NoContent();}
[HttpDelete("{id:guid}")] public async Task<IActionResult> Delete(Guid id,CancellationToken ct){await _s.DeleteRoleAsync(id,ct);return NoContent();}
[HttpPut("{id:guid}/org-types")] public async Task<IActionResult> OrgTypes(Guid id,AssignOrgTypesRequest r,CancellationToken ct){await _s.SetOrgTypesAsync(id,r.AssignableOrgTypeIds,ct);return NoContent();}}
