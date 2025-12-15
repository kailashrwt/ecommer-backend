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
<<<<<<< HEAD
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
=======
service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'knn12794@gmail.com',
        pass: process.env.EMAIL_PASS  || 'egnzwkvghdmagdqs'
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' // Only reject in production
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100
>>>>>>> 4c3cc7086115f2c9f6ca0667cb8aa84d44bcf2a7
});

/* =========================
   1. FORGOT PASSWORD
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

<<<<<<< HEAD
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
=======
        console.log('Password reset requested for:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if email exists or not
            console.log('Password reset attempted for non-existent email:', email);
            return res.status(200).json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });
        }

        // Check if there's already a valid reset token
        if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
            return res.status(200).json({
                success: true,
                message: 'A password reset link has already been sent. Please check your email.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token and set expiry (1 hour)
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Create reset URL with better error handling
        const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Enhanced email content with better styling
        const mailOptions = {
            from: `"Lara Jewellery" <${process.env.EMAIL_USER || 'knn12794@gmail.com'}>`,
            to: user.email,
            subject: 'Password Reset Request - Lara Jewellery',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset - Lara Jewellery</title>
                </head>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">💎 Lara Jewellery</h1>
                        <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Sparkling Elegance</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
                        
                        <p>Hello <strong>${user.firstName}</strong>,</p>
                        
                        <p>We received a request to reset your password for your Lara Jewellery account. Click the button below to create a new password:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); 
                                      color: white; 
                                      padding: 15px 40px; 
                                      text-decoration: none; 
                                      border-radius: 30px; 
                                      font-weight: bold;
                                      font-size: 16px;
                                      display: inline-block;
                                      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
                                      transition: all 0.3s ease;">
                                Reset Your Password
                            </a>
                        </div>
                        
                        <p style="text-align: center; color: #666; font-size: 14px;">
                            This link will expire in <strong>1 hour</strong> for your security.
                        </p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #D4AF37;">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                <strong>Important:</strong> If you didn't request this password reset, please ignore this email. 
                                Your account remains secure.
                            </p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                        
                        <p style="color: #888; font-size: 12px; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${resetUrl}" style="color: #D4AF37; word-break: break-all;">${resetUrl}</a>
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} Lara Jewellery. All rights reserved.</p>
                        <p>Where elegance meets perfection</p>
                    </div>
                </body>
                </html>
            `
        };

        // Send email with timeout
const emailPromise = transport.sendMail(mailOptions);
const timeoutPromise = new Promise((_, reject) => {
setTimeout(() => reject(new Error('Email sending timeout')), 10000);
});
     await Promise.race([emailPromise, timeoutPromise]);

        console.log('Password reset email sent successfully to:', email);

        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);

        if (error.message === 'Email sending timeout') {
            return res.status(500).json({
                success: false,
                message: 'Email service is temporarily unavailable. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error sending password reset email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
>>>>>>> 4c3cc7086115f2c9f6ca0667cb8aa84d44bcf2a7
    }

    const user = await User.findOne({ email });

    // Security: same response even if user not found
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

    const mailOptions = {
      from: `"Lara Jewellery" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset Your Password - Lara Jewellery',
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
        message: 'Invalid or expired token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

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
      subject: 'Brevo Test Email',
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

<<<<<<< HEAD
=======
// Cleanup expired tokens (optional - can be run periodically)
router.post('/cleanup-expired-tokens', async (req, res) => {
    try {
        const result = await User.updateMany(
            {
                resetPasswordExpires: { $lt: Date.now() }
            },
            {
                $unset: {
                    resetPasswordToken: 1,
                    resetPasswordExpires: 1
                }
            }
        );

        console.log(`Cleaned up ${result.modifiedCount} expired reset tokens`);

        res.json({
            success: true,
            message: `Cleaned up ${result.modifiedCount} expired reset tokens`
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cleaning up expired tokens'
        });
    }
});


>>>>>>> 4c3cc7086115f2c9f6ca0667cb8aa84d44bcf2a7
module.exports = router;
