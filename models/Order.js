const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: false
      }
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    default: "Pending"
  },

  paymentStatus: {
    type: String,
    default: "Paid"
  },

razorpayOrderId: String,
razorpayPaymentId: String,
razorpaySignature: String,
},{ timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
