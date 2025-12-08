const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const router = express.Router();

// Example admin-only route
router.get('/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome Admin ${req.user.firstName}`,
  });
});

module.exports = router;
