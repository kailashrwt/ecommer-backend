const User = require("../models/User");

exports.getAllCustomers = async (req, res) =>{
    try {
    const users = await User.find({role: "user"}).select("-password");

    res.json({
        success: true,
        customers: users,
    });
} catch (err){
    console.log("Fetch Customers Error:", err);
    res.status(500).json({success: false, message: "Server Error"});
}
};

exports.toggleCustomerStatus = async (req, res) =>{
    try{
        const { id } = req.params;

        const user = await User.findById(id);

        if(!user) return res.status(404).json({success: false, message: "User not found"});

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: user.isActive ? "User Activated" : "User blocked",
            user,
        });
    }catch (err){
        console.log("Update Customer Error:", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

exports.deleteCustomer = async (req, res) =>{
    try{
        const { id } = req.params;

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Customer Deleted Successfully",
        });
    }catch (err){
        console.log("Delete Customer Error:", err);
        res.status(500).json({success: false, message: "Server Error"});
    }
};