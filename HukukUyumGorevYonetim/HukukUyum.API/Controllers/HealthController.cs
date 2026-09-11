using Microsoft.AspNetCore.Mvc;

namespace HukukUyum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            success = true,
            message = "Hukuk ve Uyum Görev Yönetim Sistemi API çalışıyor.",
            serverTime = DateTime.UtcNow
        });
    }
}