const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");

// Tạo payment
router.post("/create", PaymentController.createPayment);

// Callback MoMo
router.post("/callback/momo", PaymentController.handleMomoCallback);

// Callback OxaPay
router.post("/callback/oxapay", PaymentController.handleOxaPayCallback);

module.exports = router;
