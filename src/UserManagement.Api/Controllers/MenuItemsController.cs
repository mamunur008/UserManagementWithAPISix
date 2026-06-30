using Microsoft.AspNetCore.Mvc; using UserManagement.Application.Abstractions; using UserManagement.Application.DTOs;
namespace UserManagement.Api.Controllers;
[ApiController,Route("api/menu-items")]
public sealed class MenuItemsController:ControllerBase
{ private readonly IMenuService _s; public MenuItemsController(IMenuService s)=>_s=s;
[HttpGet] public async Task<IActionResult> Get(CancellationToken ct)=>Ok(await _s.GetAllAsync(ct));
[HttpPost] public async Task<IActionResult> Create(UpsertMenuItemRequest r,CancellationToken ct)=>Created("",await _s.CreateAsync(r,ct));
[HttpPut("{id:guid}/roles")] public async Task<IActionResult> Roles(Guid id,[FromBody]AssignRolesRequest r,CancellationToken ct){await _s.UpdateRolesAsync(id,r.RoleIds,ct);return NoContent();}}
