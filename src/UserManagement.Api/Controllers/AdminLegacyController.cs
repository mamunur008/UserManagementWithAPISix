using Microsoft.AspNetCore.Mvc;
namespace UserManagement.Api.Controllers;
[ApiController,Route("api/v1/administration")]
public sealed class AdminLegacyController:ControllerBase
{
    [HttpPost("signin")] public IActionResult Signin([FromBody] object body)=>Ok(new{message="Legacy endpoint placeholder. Use Keycloak OIDC for real login.", token="legacy-dev-token"});
    [HttpPost("userSignup")] public IActionResult Signup([FromBody] object body)=>Created("",new{message="Legacy signup placeholder. Use /api/users saga for real provisioning."});
}
