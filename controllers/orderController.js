const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find()
        .populate("user", "firstName lastName email")
        .populate("items.product", "name price image");

        res.json({success: true, orders});
    } catch (err){
        console.log("Order Fetch Error:", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.updateOrderStatus = async (req, res) => {
    try{
        const {status} = req.body;

        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            {status},
            {new: true}
        );

        res.json({success: true, order: updated});
    }catch (err){
        console.log("Oder Update Error:", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.deleteOrder = async (req, res) =>{
    try{
        await Order.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Order deleted Successfully",
        });
    }catch (err){
        console.log("Delete Order Error:", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.createOrder = async (req, res) =>{
    try{
        const userId = req.user.id;
        const {productId, qty, totalAmount, paymentId, orderId} = req.body;

        const order = await Order.create({
            user: userId,
            items: [
                {
                    product: productId,
                    quantity: qty
                }
            ],
            totalAmount,
            status: "Pending",
            paymentStatus: "Paid",

            razorpayPaymentId: paymentId,
            razorpayOrderId: orderId,
        });

        res.json({success: true, order});
    }catch(err){
        console.log("Order Create Error:", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.getMyOrders = async (req, res) => {
    try{
        const orders = await Order.find({user: req.user.id})
        .populate("items.product", "name price image")
        .sort({ createdAt: -1 });

        res.json({success: true, orders});
    }catch (err){
        console.log("My Orders Fetch Error", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};