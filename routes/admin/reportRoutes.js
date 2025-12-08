const express = require("express");
const router = express.Router();
const { getAdminReports } = require("../../controllers/reportController");

router.get("/", getAdminReports);

module.exports = router;