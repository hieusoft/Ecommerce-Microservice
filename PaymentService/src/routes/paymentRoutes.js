const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");


router.post("/create", PaymentController.createPayment);
router.get("/callback/vnpay", PaymentController.handleVnPayCallback);
router.post("/callback/momo", PaymentController.handleMomoCallback);
router.post("/callback/oxapay", PaymentController.handleOxaPayCallback);
router.get("/", PaymentController.getAllPayments);
router.get("/status/:providerOrderId", PaymentController.getStatusByProviderOrderId);
router.get("/:orderId", PaymentController.getPaymentByOrderId);
router.get("/provider/:provider", PaymentController.getPaymentsByProvider);

module.exports = router;
