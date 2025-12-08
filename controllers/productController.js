const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete Image
    if (product.image) {
      const filePath = path.join(__dirname, "..", "..", product.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while deleting",
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, stock, description } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const newProduct = new Product({
      name,
      price,
      stock,
      category,
      image: imageUrl,
      description,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added Successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, stock, description } = req.body;

    let imageUrl = req.body.oldImage;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, category, stock, description, image: imageUrl },
      { new: true }
    );

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.log("Single Product Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;

    const products = await Product.find({ category });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Category Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getProductsByPriceRange = async (req, res) =>{
  try{
    const {min, max} = req.params;

    const query = {};

    if (min !== "all"){
      query.price ={...query.price, $gte: Number(min)};
    }

    if (max !== "all"){
      query.price = {...query.price, $lte: Number(max)};
    }

    const products = await Product.find(query);

    res.json({
      success: true,
      products,
    });
  }catch (err){
    console.log("Price Range Fetch Error:", err);
    res.status(500).json({success: false, message: "Server Error"});
  }
}
