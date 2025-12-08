const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User');

const router = express.Router();

// Email transporter configuration with improved settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'knn12794@gmail.com',
        pass: process.env.EMAIL_PASS || 'egnzwkvghdmagdqs'
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' // Only reject in production
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100
});

// 1. Request Password Reset with improved security
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

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
        const emailPromise = transporter.sendMail(mailOptions);
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
    }
});


// 2. Reset Password with Token - FIXED VERSION
router.post('/reset-password/:token', async (req, res) => {

    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // Validate input
        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and confirmation are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        console.log('4. Input validation passed');

        // Hash the token to compare with stored token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');


        // Find user with valid token - INCLUDE PASSWORD FIELD
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+password'); // THIS IS THE FIX - include password field


        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset link.'
            });
        }


        // Check if new password is different from old password
        try {
            const isSamePassword = await bcrypt.compare(password, user.password);

            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from your current password'
                });
            }
        } catch (bcryptError) {
            // Continue with reset even if comparison fails
        }

        // Hash new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.lastPasswordChange = Date.now();

        await user.save();

        // Send confirmation email
        try {
            const mailOptions = {
                from: `"Lara Jewellery" <${process.env.EMAIL_USER || 'knn12794@gmail.com'}>`,
                to: user.email,
                subject: 'Password Updated Successfully - Lara Jewellery',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Updated - Lara Jewellery</title>
                    </head>
                    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">💎 Lara Jewellery</h1>
                            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Sparkling Elegance</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="background: #27AE60; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
                                    ✓
                                </div>
                            </div>
                            
                            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Updated Successfully</h2>
                            
                            <p>Hello <strong>${user.firstName}</strong>,</p>
                            
                            <p>Your Lara Jewellery account password has been successfully reset.</p>
                            
                            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb; margin: 20px 0;">
                                <p style="margin: 0; text-align: center; font-weight: bold;">
                                    ✅ Your password has been updated successfully
                                </p>
                            </div>
                            
                            <p>You can now log in to your account with your new password.</p>
                        </div>
                    </body>
                    </html>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
        }


        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        console.log('=== PASSWORD RESET ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 3. Validate reset token
router.get('/validate-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Token is required'
            });
        }

        // Hash the token to compare with stored token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(200).json({
                success: true,
                valid: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.status(200).json({
            success: true,
            valid: true,
            message: 'Token is valid',
            email: user.email // Optional: return email for display
        });

    } catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Error validating token'
        });
    }
});

// Test email route with improved logging
router.post('/test-email', async (req, res) => {
    try {
        console.log('Testing email configuration for Lara Jewellery...');

        // Verify connection configuration
        await transporter.verify();
        console.log('Email server is ready to take our messages');

        // Send test email
        const testResult = await transporter.sendMail({
            from: `"Lara Jewellery" <${process.env.EMAIL_USER || 'knn12794@gmail.com'}>`,
            to: process.env.EMAIL_USER || 'knn12794@gmail.com',
            subject: 'Test Email - Lara Jewellery',
            text: 'This is a test email from your Lara Jewellery application!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #D4AF37; text-align: center;">💎 Lara Jewellery</h2>
                    <h3 style="color: #333; text-align: center;">Test Email Successful</h3>
                    <p>This is a test email from your Lara Jewellery application!</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="background: #D4AF37; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block;">
                            Email System Working ✅
                        </span>
                    </div>
                    <p>Your email configuration is correct and ready to send customer communications.</p>
                </div>
            `
        });

        console.log('Test email sent successfully:', testResult.messageId);

        res.json({
            success: true,
            message: 'Test email sent successfully!',
            messageId: testResult.messageId
        });
    } catch (error) {
        console.error('Email test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Email test failed',
            error: error.message
        });
    }
});

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


module.exports = router;