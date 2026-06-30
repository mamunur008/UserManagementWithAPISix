using Microsoft.AspNetCore.Mvc;
using UserManagement.Application.Abstractions;
using UserManagement.Application.DTOs;

namespace UserManagement.Api.Controllers;

[ApiController]
[Route("api/chart-of-accounts")]
public sealed class ChartOfAccountsController : ControllerBase
{
    private readonly IChartOfAccountService _service;

    public ChartOfAccountsController(IChartOfAccountService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);

        if (result is null)
            return NotFound(new { error = "chart_account_not_found" });

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateChartOfAccountRequest request,
        CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateChartOfAccountRequest request,
        CancellationToken ct)
    {
        var result = await _service.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, ct);
        return NoContent();
    }
}