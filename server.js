const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, ".env")});
const adminRoutes = require('./routes/admin/adminDashboard');
const productRoutes = require("./routes/admin/productRoutes");
const paymentRoutes = require("./routes/auth/payment");
const { log } = require('console');

const app = express();


app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'https://ecommerce-frontend-6hfj.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("MONGO_URL =", process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

app.get('/api/debug/users', async (req, res)=>{
    try{
        console.log('Fetching all users from database...');
        const users = await User.find({});
        console.log('All users in database:', users);

        res.json({
            success: true,
            totalUsers: users.length,
            users: users._id,
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.role,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt
        })
    }catch (error){
        console.error('error fetching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Routes
app.use('/api/auth', require('./routes/auth/login'));
app.use('/api/auth', require('./routes/auth/forgetPassword'));
app.use('/api/client', require('./routes/client/registration'));
app.use('/api/admin', require('./routes/admin/adminDashboard'));
app.use('/api/products', require('./routes/admin/productRoutes'));
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use('/api/cart', require('./routes/client/cartRoutes'));
app.use("/api/admin/order", require("./routes/admin/order"));
app.use('/api/order', require("./routes/client/orderRoutes"));
app.use("/api/admin/customers", require("./routes/admin/customerRoutes"));
app.use("/api/admin/reports", require("./routes/admin/reportRoutes"));
app.use('/api/payment', paymentRoutes);


// Test routes
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '🚀 Server is running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        success: true,
        message: '✅ API is working!'
    });
});

const PORT = process.env.PORT || 6060;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for: http://localhost:5173`);
});
