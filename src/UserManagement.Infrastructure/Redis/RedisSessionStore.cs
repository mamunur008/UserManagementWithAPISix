using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using UserManagement.Application.Abstractions;
using UserManagement.Application.Configuration;
using UserManagement.Domain.Entities;

namespace UserManagement.Infrastructure.Redis;
public sealed class RedisSessionStore : ISessionStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IDatabase _db; private readonly SessionOptions _options;
    public RedisSessionStore(IConnectionMultiplexer mux,IOptions<SessionOptions> options){_db=mux.GetDatabase();_options=options.Value;}
    public async Task SaveAsync(AuthSession session,CancellationToken ct){var ttl=session.ExpiresAt-DateTimeOffset.UtcNow;if(ttl<=TimeSpan.Zero)ttl=TimeSpan.FromMinutes(_options.TtlMinutes);var json=JsonSerializer.Serialize(session,JsonOptions);await _db.StringSetAsync(SessionKey(session.SessionId),json,ttl);await _db.StringSetAsync(TokenKey(session.JwtToken),session.SessionId,ttl);}
    public async Task<AuthSession?> GetAsync(string sessionId,CancellationToken ct){var value=await _db.StringGetAsync(SessionKey(sessionId));return value.HasValue?JsonSerializer.Deserialize<AuthSession>(value.ToString(),JsonOptions):null;}
    public async Task<AuthSession?> FindByTokenHashAsync(string accessToken,CancellationToken ct){var sessionId=await _db.StringGetAsync(TokenKey(accessToken));return sessionId.HasValue?await GetAsync(sessionId.ToString(),ct):null;}
    public async Task RemoveAsync(string sessionId,CancellationToken ct){var session=await GetAsync(sessionId,ct);await _db.KeyDeleteAsync(SessionKey(sessionId));if(session is not null)await _db.KeyDeleteAsync(TokenKey(session.JwtToken));}
    private static string SessionKey(string id)=>$"um:session:{id}"; private static string TokenKey(string token)=>$"um:token:{Hash(token)}"; private static string Hash(string input)=>Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input))).ToLowerInvariant();
}
