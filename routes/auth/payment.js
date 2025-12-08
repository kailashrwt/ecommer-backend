const express = require("express");
const router = express.Router();
const razorpay = require("../../config/razorpay");

router.post("/create-order", async (req, res) => {
    try{
        const { amount } = req.body;

        const option ={
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_order_" + Date.now(),
        };

        const order = await razorpay.orders.create(option);

        res.json({success: true, order});
    }catch (err){
        console.log(err);
        res.status(500).json({success: false, message: "Order failed"})
    }
});

module.exports = router;