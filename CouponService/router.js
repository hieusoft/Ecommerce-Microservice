export const ROUTERS = {
    USER: {
        HOME: "/",                                    
        SHOP: "shop/:occasion",                        
        PRODUCT: "shop/:occasion/:id",                
        COLLECTION: "collection/:slug",             
        CART: "cart",                                
        CHECKOUT: "checkout",                          
        THANKYOU: "checkout/thankyou/:order_id",      

   
        PROFILE: "profile",                            
        ORDERS: "profile/orders",
        ORDER_DETAIL: "profile/orders/:order_id",
        ADDRESS: "profile/address",

        NOTIFICATIONS: "profile/notifications",
        NOTIFICATION_DETAIL: "profile/notifications/:notification_id",

        LOGIN: "login",
        REGISTER: "register",
        FORGOT: "forgot-password",
        RESET: "reset-password",

 
        SEARCH: "search/:query",
    },

    ADMIN: {
        DASHBOARD: "admin/dashboard",

        BOUQUETS: "admin/bouquets",
        ADD_BOUQUET: "admin/bouquets/add",
        EDIT_BOUQUET: "admin/bouquets/edit/:id",

        FLOWERS: "admin/flowers",
        ADD_FLOWER: "admin/flowers/add",
        EDIT_FLOWER: "admin/flowers/edit/:id",

        OCCASIONS: "admin/occasions",                  
        ADD_OCCASION: "admin/occasions/add",
        EDIT_OCCASION: "admin/occasions/edit/:id",

        GREETINGS: "admin/greetings",
        ADD_GREETING: "admin/greetings/add",
        EDIT_GREETING: "admin/greetings/edit/:id",

      
        ORDERS: "admin/orders",
        ORDER_DETAIL: "admin/orders/:order_id",


        PAYMENTS: "admin/payments",
        PAYMENT_DETAIL: "admin/payments/:payment_id",

      
        DELIVERIES: "admin/deliveries",
        DELIVERY_DETAIL: "admin/deliveries/:delivery_id",
        DELIVERY_ROUTES: "admin/deliveries/:delivery_id/routes",

        COUPONS: "admin/coupons",
        ADD_COUPON: "admin/coupons/add",
        EDIT_COUPON: "admin/coupons/edit/:id",

    
        USERS: "admin/users",
        USER_DETAIL: "admin/users/:user_id",
        ROLES: "admin/roles",

       
        AI_RECOMMENDATIONS: "admin/ai-recommendations",
        NOTIFICATIONS: "admin/notifications",

       
        SETTINGS: "admin/settings",
    },
      SHIPPER: {
        DASHBOARD: "shipper/dashboard",                   
        DELIVERIES: "shipper/deliveries",                 
        DELIVERY_DETAIL: "shipper/deliveries/:delivery_id", 
        UPDATE_STATUS: "shipper/deliveries/:delivery_id/update-status", 
        DELIVERY_ROUTES: "shipper/deliveries/:delivery_id/routes", 
    }
};
