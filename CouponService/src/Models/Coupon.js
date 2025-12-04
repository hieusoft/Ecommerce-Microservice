class Coupon {
    constructor(id, code, discountType, discountValue, maxUses, expiryDate, occasion, minPrice, created_at, updated_at) {
        this.id = id;                    
        this.code = code;                
        this.discountType = discountType; 
        this.discountValue = discountValue; 
        this.maxUses = maxUses;          
        this.expiryDate = expiryDate;     
        this.occasion = occasion;         
        this.minPrice = minPrice;
        this.created_at = created_at;
        this.updated_at = updated_at;  
    }
}

module.exports = Coupon;
