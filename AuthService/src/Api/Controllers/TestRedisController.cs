using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestRedisController : ControllerBase
    {
        private readonly IRedisService _redis;

        public TestRedisController(IRedisService redis)
        {
            _redis = redis;
        }

        [HttpGet]
        public async Task<IActionResult> Test()
        {
            await _redis.SetStringAsync("hello", "world", TimeSpan.FromMinutes(1));

            var value = await _redis.GetStringAsync("hello");

            return Ok(new { value });
        }
        
    }
}
