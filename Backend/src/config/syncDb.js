import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { sequelize, User, Store, Rating } from "../models/index.js";

const seedDatabase = async () => {
  try {
    // First, connect to MySQL server without database to check/create database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
    });

    const dbName = process.env.DB_NAME || "store_rating_db";
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`✅ Database '${dbName}' checked/created.`);

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

