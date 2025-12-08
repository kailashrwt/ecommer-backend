const express = require("express");
const router = express.Router();
const {protect} = require("../../middleware/auth");
const {addToCart, getMyCart, updateCartItem, removeCartItem} = require("../../controllers/cartController");

router.post("/add", protect, addToCart);
router.get("/me", protect, getMyCart);
router.put("/update", protect, updateCartItem);
router.delete("/item/:productId", protect, removeCartItem);

module.exports = router;