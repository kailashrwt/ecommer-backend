const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.getAdminReports = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalSales = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const bestSellingProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    qty: { $sum: "$items.quantity" }
                }
            },
            { $sort: { qty: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            }
        ]);

        res.json({
            success: true,
            report: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalSales: totalSales[0]?.total || 0,
                ordersByStatus,
                bestSellingProducts
            }
        });

    } catch (err) {
        console.log("Report Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
