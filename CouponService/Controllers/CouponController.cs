using CouponService.Data;
using CouponService.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using CouponService.Service;

namespace CouponService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly RabbitMqService _rabbitMqService;

        public CouponController(AppDbContext context, RabbitMqService rabbitMqService)
        {
            _context = context;
            _rabbitMqService = rabbitMqService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _context.Coupons.ToListAsync();
            return Ok(coupons);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Id == id);
            if (coupon == null)
                return NotFound();
            return Ok(coupon);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Coupon coupon)
        {
            if (coupon == null)
                return BadRequest();

            await _context.Coupons.AddAsync(coupon);
            await _context.SaveChangesAsync();
            _rabbitMqService.Publish("coupon_event", "coupon.create", new
            {
                coupon.Id,
                coupon.Code,
                coupon.Discount,
                coupon.MaxUses,
                coupon.ExpiryDate,
            });
            return CreatedAtAction(nameof(GetById), new { id = coupon.Id }, coupon);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Coupon coupon)
        {
            if (coupon == null || id != coupon.Id)
                return BadRequest();

            var existingCoupon = await _context.Coupons.FindAsync(id);
            if (existingCoupon == null)
                return NotFound();

            existingCoupon.Code = coupon.Code;
            existingCoupon.Discount = coupon.Discount;
            existingCoupon.MaxUses = coupon.MaxUses;
            existingCoupon.ExpiryDate = coupon.ExpiryDate;

            _context.Coupons.Update(existingCoupon);
            await _context.SaveChangesAsync();

            _rabbitMqService.Publish("coupon_event", "coupon.update", new
            {
                existingCoupon.Id,
                existingCoupon.Code,
                existingCoupon.Discount,
                existingCoupon.MaxUses,
                existingCoupon.ExpiryDate,
            });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                return NotFound();

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();

            _rabbitMqService.Publish("coupon_event", "coupon.delete", new
            {
                coupon.Id,
                coupon.Code
            });

            return NoContent();
        }

    }
}
