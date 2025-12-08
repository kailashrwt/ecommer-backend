const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
try{
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName || !email || !password){
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

   console.log(password)

    const newUser = new User({
        firstName,
        lastName,
        email,
        password
    });

    console.log('saving user to database')
    await newUser.save();

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user:{
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
        }
    });
} catch(error){
    console.error('registration error:', error);

    if (error.code === 11000){
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

    if(error.name ==='ValidationError'){
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
}
});

module.exports = router;