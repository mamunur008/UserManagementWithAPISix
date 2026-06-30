using System.Text.Json;
using UserManagement.Domain.Errors;

namespace UserManagement.Api.Middleware;

public sealed class ErrorEnvelopeMiddleware
{
    private readonly RequestDelegate _next;
    public ErrorEnvelopeMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = ex.ErrorCode, message = ex.Message }));
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "server_error", message = ex.Message }));
        }
    }
}
