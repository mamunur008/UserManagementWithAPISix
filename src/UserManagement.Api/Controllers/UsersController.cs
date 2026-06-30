using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;
namespace UserManagement.Api.Controllers;

[ApiController, Route("api/users")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _service; public UsersController(IUserService service)=>_service=service;
    [HttpGet] public async Task<ActionResult<IReadOnlyCollection<UserDto>>> Get(CancellationToken ct)=>Ok(await _service.GetUsersAsync(ct));
    [HttpGet("{id:guid}")] public async Task<ActionResult<UserDto>> Get(Guid id,CancellationToken ct)=>(await _service.GetUserAsync(id,ct)) is { } u?Ok(u):NotFound();
    [HttpPost] public async Task<ActionResult<UserDto>> Create(CreateUserRequest request,CancellationToken ct)=>Created("",await _service.CreateUserAsync(request,Request.Headers["Idempotency-Key"].FirstOrDefault()??Guid.NewGuid().ToString("N"),ct));
    [HttpPut("{id:guid}")] public async Task<IActionResult> Update(Guid id,UpdateUserRequest request,CancellationToken ct){await _service.UpdateUserAsync(id,request,Request.Headers["Idempotency-Key"].FirstOrDefault()??Guid.NewGuid().ToString("N"),ct);return NoContent();}
    [HttpPost("{id:guid}/deactivate")] public async Task<IActionResult> Deactivate(Guid id,CancellationToken ct){await _service.DeactivateUserAsync(id,Request.Headers["Idempotency-Key"].FirstOrDefault()??Guid.NewGuid().ToString("N"),ct);return NoContent();}
    [HttpGet("{userId:guid}/roles")] public async Task<IActionResult> Roles(Guid userId,CancellationToken ct)=>Ok(await _service.GetRolesByUserAsync(userId,ct));
    [HttpPost("{userId:guid}/roles/{roleId:guid}")] public async Task<IActionResult> Assign(Guid userId,Guid roleId,CancellationToken ct){await _service.SetUserRolesAsync(userId,new[]{roleId},Request.Headers["Idempotency-Key"].FirstOrDefault()??Guid.NewGuid().ToString("N"),ct);return NoContent();}
    [HttpDelete("{userId:guid}/roles/{roleId:guid}")] public async Task<IActionResult> Remove(Guid userId,Guid roleId,CancellationToken ct){var existing=(await _service.GetRolesByUserAsync(userId,ct)).Where(r=>r.Id!=roleId).Select(r=>r.Id).ToArray();await _service.SetUserRolesAsync(userId,existing,Request.Headers["Idempotency-Key"].FirstOrDefault()??Guid.NewGuid().ToString("N"),ct);return NoContent();}
}
