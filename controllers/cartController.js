const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.addToCart = async (req, res) =>{
    try{
        const{productId} = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if(!product)
            return res.status(404).json({success: false, message: "Product not found"});

        let cart = await Cart.findOne({userId});
        if (!cart) cart = new Cart({userId, items: [] });

        const index = cart.items.findIndex((i) => i.productId == productId);

        if (index > -1) {
            cart.items[index].quantity +=1;
        }else {
            cart.items.push({
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        });
        }

        await cart.save();

        const totalItems = cart.items.reduce((sum, it) => sum + it.quantity, 0);

        res.json({ success: true, message: "Added to cart", cart, totalItems});
    }catch (err){
        console.log("Cart Error", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.getMyCart = async (req, res) =>{
    try{
        const cart = await Cart.findOne({userId: req.user.id});

        if(!cart){
            return res.json({sucess: true, items: [], totalItems: 0});
        }

        const totalItems = cart.items.reduce((s, i) => s +i.quantity, 0);

        res.json({ success: true, items: cart.items, totalItems});
    }catch (err){
        console.log(err);
        res.status(500).json({success: false});
    }
};

exports.getMyCart = async (req, res) => {
    try{
        const userId = req.user.id;

        const cart = await Cart.findOne({userId});

        if (!cart){
            return res.json({
                success: true,
                items: [],
                totalItems: 0,
            })
        }

        const totalItems = cart.items.reduce((sum, it) => sum + it.quantity, 0);

        res.json({
            success: true,
            items: cart.items,
            totalItems,
        });

    }catch(err){
        console.log("Get Cart Error", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.updateCartItem = async (req, res) => {
    try{
        const {productId, quantity} = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({userId});
        if (!cart) return res.status(404).json({success: false});

        const item = cart.items.find(i => i.productId == productId);
        if(!item) return res.status(404).json({success: false});

        item.quantity = quantity;

        await cart.save();

        const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

        res.json({success: true, items: cart.items, totalItems});
    }catch (err){
        console.log(err);
        res.status(500).json({succes: false});
    }
};

exports.removeCartItem = async (req, res) => {
    try{
        const userId = req.user.id;
        const {productId} = req.params;

        let cart = await Cart.findOne({userId});
        if(!cart) return res.status(404).json({success: false});

        cart.items = cart.items.filter(i => i.productId != productId);

        await cart.save();

        const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);

        res.json({succes: true, items: cart.items, totalItems});

    }catch (err){
        console.log(err);
        res.status(500).json({succes: false});
    }
};