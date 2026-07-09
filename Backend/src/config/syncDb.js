import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { sequelize, User, Store, Rating } from "../models/index.js";

const seedDatabase = async () => {
  try {
    // Sync all models (create tables if not exist)
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully.");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@storerating.com" },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await User.create({
        name: "System Administrator User",
        email: "admin@storerating.com",
        password: hashedPassword,
        address: "123 Admin Street, System City, SC 00001",
        role: "admin",
      });
      console.log("✅ Default admin created.");
      console.log("   Email: admin@storerating.com");
      console.log("   Password: Admin@123");
    } else {
      console.log("ℹ️  Admin already exists, skipping seed.");
    }

    console.log("\n🎉 Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
};

seedDatabase();
