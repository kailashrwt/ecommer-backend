const express = require("express");
const router = express.Router();

const{getAllOrders, updateOrderStatus, deleteOrder } = require("../../controllers/orderController");

router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;