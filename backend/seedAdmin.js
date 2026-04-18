const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); // Naya Admin model
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // MongoDB connection (Check your .env for MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name");
    console.log("Connected to MongoDB...");

    const adminEmail = "khuzaima@gmail.com";
    const adminPass = "khuzaima";

    // Check if admin already exists in 'admins' collection
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPass, salt);

      const newAdmin = new Admin({
        username: "Khuzaima Admin",
        email: adminEmail,
        password: hashedPassword
      });

      await newAdmin.save();
      console.log("✅ Admin added to 'admins' section successfully!");
    } else {
      console.log("ℹ️ Admin already exists in 'admins' section.");
    }

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedAdmin();