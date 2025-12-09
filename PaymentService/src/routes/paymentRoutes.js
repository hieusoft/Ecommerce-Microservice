const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const retryRateLimiter = require("../middleware/retryRateLimiter");

router.post("/create", PaymentController.createPayment);
router.get("/callback/vnpay", PaymentController.handleVnPayCallback);
router.post("/callback/momo", PaymentController.handleMomoCallback);
router.post("/callback/oxapay", PaymentController.handleOxaPayCallback);
router.get("/", PaymentController.getAllPayments);
router.get("/status/:providerOrderId", PaymentController.getStatusByProviderOrderId);
router.get("/:orderId", PaymentController.getPaymentByOrderId);
router.get("/provider/:provider", PaymentController.getPaymentsByProvider);
router.post("/retry/:orderId/:provider",retryRateLimiter, PaymentController.retryPayment);

module.exports = router;
