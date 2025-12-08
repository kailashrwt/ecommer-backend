const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const router = express.Router();

router.post('/login', async (req, res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

            const user = await User.findOne({email}).select('+password');

            if(!user){
                console.log('User not found', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentils'
                });
            }

            if(!user.isActive){
                return res.status(401).json({
                    success:false,
                    message: 'Account is deactivated. Please contact support.'
                })
            }

            
            const isPasswordValid = await user.matchPassword(password);
            
            
            if(!isPasswordValid){
                console.log('Invalid password for user:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentils'
                });
            }

        
            user.lastLogin = Date.now();
            await user.save();

            const token = jwt.sign({
                id: user._id,
                email: user.email,
                role: user.role
            },
        process.env.JWT_SECRET || 'your-jwt-secret',
        {expiresIn: process.env.JWT_EXPRIRE || '30d'}
        );

        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            lastLogin : user.lastLogin,
            createdAt: user.createdAt
        };

        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token, 
            user:{
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

        } catch (error){
            console.error('Login error:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
});

router.get('/me', async (req, res) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];

        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provide'
            })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

        const user = await User.findById(decoded.id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user:{
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });
    } catch(error) {
        console.error('Get user error: ', error);

        if(error.name ==='JsonWedTokenError'){
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;