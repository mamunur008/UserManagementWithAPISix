using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using UserManagement.Application.Abstractions;
using UserManagement.Application.Configuration;
using UserManagement.Application.DTOs;

namespace UserManagement.Infrastructure.Keycloak;

public sealed class KeycloakAdminClient : IKeycloakAdminClient
{
    private readonly HttpClient _http; private readonly KeycloakOptions _options;
    public KeycloakAdminClient(HttpClient http, IOptions<KeycloakOptions> options){_http=http;_options=options.Value;}
    public async Task<string> CreateUserAsync(CreateUserRequest request,CancellationToken ct)
    {
        var payload=new{username=request.Username,email=request.Email,firstName=request.FirstName,lastName=request.LastName,enabled=true,emailVerified=true,credentials=request.TemporaryPassword is null?Array.Empty<object>():new object[]{new{type="password",value=request.TemporaryPassword,temporary=true}}};
        using var req=await Authorized(HttpMethod.Post,$"{_options.AdminRealmBaseUrl}/users",ct,JsonContent.Create(payload)); var res=await _http.SendAsync(req,ct); await Ensure(res,ct); return res.Headers.Location?.Segments.Last().Trim('/') ?? string.Empty;
    }
    public async Task UpdateUserAsync(string keycloakUserId,UpdateUserRequest r,CancellationToken ct){using var req=await Authorized(HttpMethod.Put,$"{_options.AdminRealmBaseUrl}/users/{Uri.EscapeDataString(keycloakUserId)}",ct,JsonContent.Create(new{email=r.Email,firstName=r.FirstName,lastName=r.LastName,enabled=r.Active}));await Ensure(await _http.SendAsync(req,ct),ct);}
    public async Task DeleteUserAsync(string keycloakUserId,CancellationToken ct){using var req=await Authorized(HttpMethod.Delete,$"{_options.AdminRealmBaseUrl}/users/{Uri.EscapeDataString(keycloakUserId)}",ct);await Ensure(await _http.SendAsync(req,ct),ct);}
    public async Task<string> CreateRealmRoleAsync(string name,string description,CancellationToken ct){using var req=await Authorized(HttpMethod.Post,$"{_options.AdminRealmBaseUrl}/roles",ct,JsonContent.Create(new{name,description}));await Ensure(await _http.SendAsync(req,ct),ct);var role=await GetRole(name,ct);return role?.Id??name;}
    public async Task DeleteRealmRoleAsync(string keycloakRoleId,CancellationToken ct){var role=await GetRoleById(keycloakRoleId,ct); if(role?.Name is null)return; using var req=await Authorized(HttpMethod.Delete,$"{_options.AdminRealmBaseUrl}/roles/{Uri.EscapeDataString(role.Name)}",ct);await Ensure(await _http.SendAsync(req,ct),ct);}
    public async Task SetUserRealmRolesAsync(string keycloakUserId,IReadOnlyCollection<string> keycloakRoleIds,CancellationToken ct)
    {
        var all=await GetRoles(ct); var target=all.Where(x=>keycloakRoleIds.Contains(x.Id??"")||keycloakRoleIds.Contains(x.Name??"")).ToArray();
        var current=await GetUserRoles(keycloakUserId,ct); if(current.Count>0){using var del=await Authorized(HttpMethod.Delete,$"{_options.AdminRealmBaseUrl}/users/{keycloakUserId}/role-mappings/realm",ct,JsonContent.Create(current));await Ensure(await _http.SendAsync(del,ct),ct);} if(target.Length>0){using var add=await Authorized(HttpMethod.Post,$"{_options.AdminRealmBaseUrl}/users/{keycloakUserId}/role-mappings/realm",ct,JsonContent.Create(target));await Ensure(await _http.SendAsync(add,ct),ct);} }
    public async Task SetRoleCompositesAsync(string roleName,IReadOnlyCollection<string> permissionRoleNames,CancellationToken ct)
    {
        var all=await GetRoles(ct); var target=all.Where(x=>permissionRoleNames.Contains(x.Name??"")).ToArray(); using var add=await Authorized(HttpMethod.Post,$"{_options.AdminRealmBaseUrl}/roles/{Uri.EscapeDataString(roleName)}/composites",ct,JsonContent.Create(target));await Ensure(await _http.SendAsync(add,ct),ct);
    }
    private async Task<HttpRequestMessage> Authorized(HttpMethod method,string url,CancellationToken ct,HttpContent? content=null){var token=await AdminToken(ct);var req=new HttpRequestMessage(method,url){Content=content};req.Headers.Authorization=new AuthenticationHeaderValue("Bearer",token);return req;}
    private async Task<string> AdminToken(CancellationToken ct){var form=new Dictionary<string,string>{{"grant_type","client_credentials"},{"client_id",_options.AdminClientId},{"client_secret",_options.AdminClientSecret}};var res=await _http.PostAsync($"{_options.RealmBaseUrl}/protocol/openid-connect/token",new FormUrlEncodedContent(form),ct);await Ensure(res,ct);var json=await res.Content.ReadFromJsonAsync<JsonElement>(cancellationToken:ct);return json.GetProperty("access_token").GetString()!;}
    private async Task<List<KcRole>> GetRoles(CancellationToken ct){using var req=await Authorized(HttpMethod.Get,$"{_options.AdminRealmBaseUrl}/roles",ct);var res=await _http.SendAsync(req,ct);await Ensure(res,ct);return await res.Content.ReadFromJsonAsync<List<KcRole>>(cancellationToken:ct)??[];}
    private async Task<KcRole?> GetRole(string name,CancellationToken ct){using var req=await Authorized(HttpMethod.Get,$"{_options.AdminRealmBaseUrl}/roles/{Uri.EscapeDataString(name)}",ct);var res=await _http.SendAsync(req,ct);if(!res.IsSuccessStatusCode)return null;return await res.Content.ReadFromJsonAsync<KcRole>(cancellationToken:ct);}
    private async Task<KcRole?> GetRoleById(string id,CancellationToken ct)=> (await GetRoles(ct)).FirstOrDefault(x=>x.Id==id);
    private async Task<List<KcRole>> GetUserRoles(string userId,CancellationToken ct){using var req=await Authorized(HttpMethod.Get,$"{_options.AdminRealmBaseUrl}/users/{userId}/role-mappings/realm",ct);var res=await _http.SendAsync(req,ct);await Ensure(res,ct);return await res.Content.ReadFromJsonAsync<List<KcRole>>(cancellationToken:ct)??[];}
    private static async Task Ensure(HttpResponseMessage res,CancellationToken ct){if(res.IsSuccessStatusCode)return;throw new InvalidOperationException(await res.Content.ReadAsStringAsync(ct));}
    private sealed record KcRole(string? Id,string? Name,string? Description);
}
