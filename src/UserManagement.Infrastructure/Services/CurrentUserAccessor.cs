using Microsoft.AspNetCore.Http;
using UserManagement.Application.Abstractions;

// namespace UserManagement.Infrastructure.Security;

namespace UserManagement.Infrastructure.Services;

public sealed class CurrentUserAccessor : ICurrentUserAccessor
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserAccessor(IHttpContextAccessor http)
    {
        _http = http;
    }

    public string? Subject =>
        _http.HttpContext?.Request.Headers["X-User-Id"].FirstOrDefault();

    public string? UserId => Subject;

    public string? Username =>
        _http.HttpContext?.Request.Headers["X-Username"].FirstOrDefault();

    public string[] Roles =>
        SplitHeader("X-Roles");

    public string[] Permissions =>
        SplitHeader("X-Permissions");

    private string[] SplitHeader(string headerName)
    {
        var value = _http.HttpContext?.Request.Headers[headerName].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(value))
            return Array.Empty<string>();

        return value
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}