import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { sequelize, User, Store, Rating } from "../models/index.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Add a new user (any role)
// @route   POST /api/admin/users
// @access  Private/Admin
export const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Role validation
    if (!["admin", "user", "store_owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Email check
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Add User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    List all users (with filters and sorting)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = "name", order = "ASC" } = req.query;

    const whereClause = {};

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [Op.like]: `%${address}%` };
    }
    if (role) {
      whereClause.role = role;
    }

    // Validate sorting field
    const validSortFields = ["name", "email", "address", "role", "createdAt"];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : "name";
    const actualOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const users = await User.findAll({
      where: whereClause,
      attributes: ["id", "name", "email", "address", "role", "createdAt"],
      order: [[actualSortField, actualOrder]],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get details of a user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "address", "role", "createdAt"],
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["id", "name", "email", "address"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toJSON();

    if (user.role === "store_owner" && user.store) {
      // Calculate overall rating for this store
      const avgRatingResult = await Rating.findOne({
        where: { store_id: user.store.id },
        attributes: [[sequelize.fn("AVG", sequelize.col("value")), "avgRating"]],
      });

      const avgRating = avgRatingResult ? avgRatingResult.get("avgRating") : 0;
      userData.store.overallRating = avgRating ? parseFloat(parseFloat(avgRating).toFixed(1)) : 0;
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Add a new store
// @route   POST /api/admin/stores
// @access  Private/Admin
export const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: "Name, email, and address are required" });
    }

    // Check if store owner user exists
    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner || owner.role !== "store_owner") {
        return res.status(400).json({ message: "Invalid owner. Owner must be a registered store owner." });
      }

      // Check if this owner already has a store
      const existingStore = await Store.findOne({ where: { owner_id } });
      if (existingStore) {
        return res.status(400).json({ message: "This user already owns another store." });
      }
    }

    // Email check
    const existingStoreEmail = await Store.findOne({ where: { email } });
    if (existingStoreEmail) {
      return res.status(400).json({ message: "Store with this email already exists" });
    }

    const store = await Store.create({
      name,
      email,
      address,
      owner_id: owner_id || null,
    });

    res.status(201).json({
      message: "Store created successfully",
      store,
    });
  } catch (error) {
    console.error("Add Store Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    List all stores (with filters, sorting, and average rating)
// @route   GET /api/admin/stores
// @access  Private/Admin
export const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = "name", order = "ASC" } = req.query;

    const whereClause = {};

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      whereClause.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      whereClause.address = { [Op.like]: `%${address}%` };
    }

    const actualOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Query stores and inject aggregate rating
    const stores = await Store.findAll({
      where: whereClause,
      attributes: [
        "id",
        "name",
        "email",
        "address",
        "owner_id",
        [
          sequelize.literal(`(
            SELECT COALESCE(ROUND(AVG(value), 1), 0)
            FROM ratings AS r
            WHERE r.store_id = Store.id
          )`),
          "overallRating",
        ],
      ],
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    // Handle in-memory sorting for overallRating if requested
    let sortedStores = [...stores];
    if (sortBy === "overallRating") {
      sortedStores.sort((a, b) => {
        const ratingA = parseFloat(a.getDataValue("overallRating")) || 0;
        const ratingB = parseFloat(b.getDataValue("overallRating")) || 0;
        return actualOrder === "DESC" ? ratingB - ratingA : ratingA - ratingB;
      });
    } else {
      const validSortFields = ["name", "email", "address"];
      const actualSortField = validSortFields.includes(sortBy) ? sortBy : "name";
      sortedStores.sort((a, b) => {
        const valA = (a.getDataValue(actualSortField) || "").toString().toLowerCase();
        const valB = (b.getDataValue(actualSortField) || "").toString().toLowerCase();
        if (valA < valB) return actualOrder === "DESC" ? 1 : -1;
        if (valA > valB) return actualOrder === "DESC" ? -1 : 1;
        return 0;
      });
    }

    res.status(200).json(sortedStores);
  } catch (error) {
    console.error("Get Stores Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
