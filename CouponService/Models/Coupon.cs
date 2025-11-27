using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CouponService.Models;

[Index("Code", Name = "UQ__Coupons__357D4CF97B02EC47", IsUnique = true)]
public partial class Coupon
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("code")]
    [StringLength(20)]
    [Unicode(false)]
    public string Code { get; set; } = null!;

    [Column("discount", TypeName = "decimal(5, 2)")]
    public decimal Discount { get; set; }

    [Column("max_uses")]
    public int? MaxUses { get; set; }

    [Column("expiry_date")]
    public DateTime ExpiryDate { get; set; }
}
