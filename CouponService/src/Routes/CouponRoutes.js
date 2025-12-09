const express = require('express');
const CouponController = require('../Controllers/CouponController');

const CouponRoutes = (rabbitMQService) => {
    const router = express.Router();

    const couponController = new CouponController(rabbitMQService);

  
    router.get('/', (req, res) => couponController.getAll(req, res));

   
    router.post('/', (req, res) => couponController.create(req, res, rabbitMQService));

    
    router.get('/:id', (req, res) => couponController.getById(req, res));

  
    router.put('/:id', (req, res) => couponController.update(req, res));

  
    router.delete('/:id', (req, res) => couponController.delete(req, res));

    
    router.post('/validate', (req, res) => couponController.validateCoupon(req, res));

    return router;
};

module.exports = CouponRoutes;
