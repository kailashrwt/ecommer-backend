const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const{addProduct, getProducts, deleteProduct, updateProduct, getSingleProduct, getProductsByCategory, getProductsByPriceRange, } = require("../../controllers/productController");

router.post("/add", upload.single("image"), addProduct);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.get("/:id", getSingleProduct);
router.get("/category/:category", getProductsByCategory);
router.get("/price/:min/:max", getProductsByPriceRange);

module.exports = router;