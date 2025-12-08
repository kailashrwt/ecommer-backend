const express = require("express");
const router = express.Router();
const {createOrder, getMyOrders} = require("../../controllers/orderController");
const {protect} = require("../../middleware/auth");

router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

module.exports = router;