using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;

namespace UserManagement.Api.Controllers;

[ApiController]
[Route("api/permissions")]
public sealed class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissions;

    public PermissionsController(IPermissionService permissions)
    {
        _permissions = permissions;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<PermissionDto>>> GetAll(CancellationToken ct)
    {
        var result = await _permissions.GetPermissionsAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PermissionDto>> Get(Guid id, CancellationToken ct)
    {
        var result = await _permissions.GetPermissionAsync(id, ct);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PermissionDto>> Create(
        [FromBody] CreatePermissionRequest request,
        CancellationToken ct)
    {
        var result = await _permissions.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PermissionDto>> Update(
        Guid id,
        [FromBody] UpdatePermissionRequest request,
        CancellationToken ct)
    {
        var result = await _permissions.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _permissions.DeleteAsync(id, ct);
        return NoContent();
    }
}