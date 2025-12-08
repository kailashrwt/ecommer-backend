const express = require("express");
const router = express.Router();

const{getAllCustomers, toggleCustomerStatus, deleteCustomer} =require("../../controllers/adminController");

router.get("/", getAllCustomers);
router.put("/toggle/:id", toggleCustomerStatus);
router.delete("/:id", deleteCustomer);

module.exports = router