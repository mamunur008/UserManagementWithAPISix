using Microsoft.AspNetCore.Mvc; using UserManagement.Application.Abstractions; using UserManagement.Application.DTOs;
namespace UserManagement.Api.Controllers;
[ApiController,Route("api/payment-accounts")]
public sealed class PaymentAccountsController:ControllerBase
{ private readonly IPaymentAccountService _s; public PaymentAccountsController(IPaymentAccountService s)=>_s=s;
[HttpGet] public async Task<IActionResult> Get(CancellationToken ct)=>Ok(await _s.GetAsync(ct));
[HttpPost] public async Task<IActionResult> Create(UpsertPaymentAccountRequest r,CancellationToken ct)=>Created("",await _s.CreateAsync(r,ct));
[HttpPost("{id:guid}/set-default")] public async Task<IActionResult> Default(Guid id,CancellationToken ct){await _s.SetDefaultAsync(id,ct);return NoContent();}}
