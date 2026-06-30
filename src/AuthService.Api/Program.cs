using UserManagement.Application;
using UserManagement.Application.Services;
using UserManagement.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer(); builder.Services.AddSwaggerGen(); builder.Services.AddApplication(); builder.Services.AddInfrastructure(builder.Configuration);
var app = builder.Build(); app.UseSwagger(); app.UseSwaggerUI(); app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "AuthService.Api" }));
app.MapMethods("/api/auth/verify", ["GET", "POST"], async (HttpContext http, AuthVerificationService verifier, CancellationToken ct) => { var result = await verifier.VerifyAsync(http.Request.Headers.Authorization.FirstOrDefault(), http.Request.Headers["X-Session-Id"].FirstOrDefault(), ct); if (!result.IsAuthenticated) return Results.Unauthorized(); http.Response.Headers["X-User-Id"] = result.UserId ?? string.Empty; http.Response.Headers["X-Username"] = result.Username ?? string.Empty; http.Response.Headers["X-Roles"] = string.Join(',', result.Roles); http.Response.Headers["X-Session-Id"] = result.SessionId ?? string.Empty; return Results.Ok(new { authenticated = true }); });
app.MapPost("/api/auth/session/logout", async (HttpContext http, AuthVerificationService verifier, CancellationToken ct) => { var sid = http.Request.Headers["X-Session-Id"].FirstOrDefault(); if (!string.IsNullOrWhiteSpace(sid)) await verifier.LogoutAsync(sid, ct); return Results.NoContent(); });
app.Run();
