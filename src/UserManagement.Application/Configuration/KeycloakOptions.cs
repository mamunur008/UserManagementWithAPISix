namespace UserManagement.Application.Configuration;

public sealed class KeycloakOptions
{
    // Internal Docker URL. Services use this to call Keycloak.
    public string BaseUrl { get; init; } = "http://keycloak:8080";
    public string Realm { get; init; } = "usermanagement";

    // Browser/public issuer. Because the React app logs in through http://localhost:8080,
    // Keycloak puts this value in the token `iss` claim.
     public string Issuer { get; init; } = "http://localhost:8080/realms/usermanagement";
    public string[] ValidIssuers { get; set; } = Array.Empty<string>();

    // Internal Docker URL for downloading signing keys.
    public string JwksUrl { get; init; } = "http://keycloak:8080/realms/usermanagement/protocol/openid-connect/certs";

    public string IntrospectionUrl { get; init; } = "http://keycloak:8080/realms/usermanagement/protocol/openid-connect/token/introspect";

    public string PublicClientId { get; init; } = "usermanagement-web";
    public string ClientId { get; init; } = "usermanagement-web";
    public string AdminClientId { get; init; } = "usermanagement-api";
    public string AdminClientSecret { get; init; } = "local-dev-secret-change-me";

    public string RealmBaseUrl => $"{BaseUrl.TrimEnd('/')}/realms/{Realm}";
    public string AdminRealmBaseUrl => $"{BaseUrl.TrimEnd('/')}/admin/realms/{Realm}";
}
