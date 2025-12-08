const mongoose = require("mongoose");
const Product = require("./Product");

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" , require: true},
    items:[
        {
            productId: {type: mongoose.Schema.Types.ObjectId,ref: "Product"},
            name: String,
            price: Number,
            image: String,
            quantity:{ type: Number, default: 1}
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model("Cart", CartSchema);