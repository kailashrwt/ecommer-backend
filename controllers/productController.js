const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
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

     // ✅ SAFE delete
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
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
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image not received from frontend"
      });
    }

    const { name, price, category, stock, description } = req.body;

    const newProduct = new Product({
      name,
      price,
      category,
      stock,
      description,
      image: req.file.path,
      imagePublicId: req.file.filename,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });

  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
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

    // 1️⃣ existing product fetch karo
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let imageUrl = product.image;
    let imagePublicId = product.imagePublicId;

    // 2️⃣ agar nayi image aayi hai
    if (req.file) {
      // old image delete
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }

      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    // 3️⃣ update
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        category,
        stock,
        description,
        image: imageUrl,
        imagePublicId,
      },
      { new: true }
    );

    res.json({ success: true, product: updated });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Update failed" });
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
