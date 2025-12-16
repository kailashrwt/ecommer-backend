const express = require('express');
const crypto = require('crypto');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require('../../models/User');

const router = express.Router();

/* =========================
   BREVO API SETUP
========================= */
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* =========================
   FORGOT PASSWORD
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    const user = await User.findOne({ email });

    // 🔐 Security: same response even if user not found
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 📧 Send email via Brevo API
    await emailApi.sendTransacEmail({
      sender: {
        name: 'Lara Jewellery',
        email: 'no-reply@larajewellery.com'
      },
      to: [
        { email: user.email }
      ],
      subject: 'Reset Your Password - Lara Jewellery',
      htmlContent: `
        <div style="font-family:Arial;padding:20px">
          <h2>Password Reset</h2>
          <p>Hello <b>${user.firstName || 'User'}</b>,</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}"
             style="display:inline-block;
                    padding:12px 24px;
                    background:#D4AF37;
                    color:#000;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;">
            Reset Password
          </a>
          <p style="margin-top:20px;font-size:13px;color:#555">
            This link will expire in 1 hour.
          </p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    // ❗ Always return success (security + UX)
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }
});

module.exports = router;
