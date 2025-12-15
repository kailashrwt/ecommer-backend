const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User');

const router = express.Router();

/* =========================
   BREVO SMTP TRANSPORTER
========================= */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
connectionTimeOut: 10000,
greetingTimeout:10000,
});

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);


/* =========================
   1. FORGOT PASSWORD
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    // Security: same response even if user not found
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Lara Jewellery" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset - Lara Jewellery',
      html: `
        <h2>Password Reset</h2>
        <p>Hello <b>${user.firstName || 'User'}</b>,</p>
        <p>Click the button below to reset your password:</p>
        <p>
          <a href="${resetUrl}"
             style="padding:12px 25px;
                    background:#D4AF37;
                    color:white;
                    text-decoration:none;
                    border-radius:5px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email'
    });
  }
});

/* =========================
   2. RESET PASSWORD
========================= */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = Date.now();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

/* =========================
   3. TEST EMAIL
========================= */
router.post('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Lara Jewellery" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Brevo SMTP Test',
      text: 'Brevo SMTP is working perfectly 🚀'
    });

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed'
    });
  }
});

module.exports = router;
