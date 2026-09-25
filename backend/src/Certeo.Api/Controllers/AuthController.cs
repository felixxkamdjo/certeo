using Certeo.Api.Modules.Identity.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Certeo.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email et mot de passe sont obligatoires." });
        }

        var result = await _authService.LoginAsync(request.Email, request.Password, cancellationToken);

        if (result is null)
        {
            return Unauthorized(new { message = "Identifiants invalides." });
        }

        return Ok(result);
    }
}