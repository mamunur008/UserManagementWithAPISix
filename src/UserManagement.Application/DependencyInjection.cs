using Microsoft.Extensions.DependencyInjection;
using UserManagement.Application.Services;

namespace UserManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthFacade>();
        services.AddScoped<AuthVerificationService>();
        return services;
    }
}
