import { Op } from "sequelize";
import { sequelize, User, Store, Rating } from "../models/index.js";

// @desc    Get all stores with overall rating and current user's submitted rating
// @route   GET /api/user/stores
// @access  Private/User
export const getStoresForUser = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    const stores = await Store.findAll({
      where: whereClause,
      attributes: [
        "id",
        "name",
        "email",
        "address",
        [
          sequelize.literal(`(
            SELECT COALESCE(ROUND(AVG(value), 1), 0)
            FROM ratings AS r
            WHERE r.store_id = Store.id
          )`),
          "overallRating",
        ],
        [
          sequelize.literal(`(
            SELECT value
            FROM ratings AS r
            WHERE r.store_id = Store.id AND r.user_id = ${userId}
            LIMIT 1
          )`),
          "userRating",
        ],
      ],
      order: [["name", "ASC"]],
    });

    res.status(200).json(stores);
  } catch (error) {
    console.error("Get User Stores Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Submit a new rating for a store (1 to 5)
// @route   POST /api/user/ratings
// @access  Private/User
export const submitRating = async (req, res) => {
  try {
    const { storeId, value } = req.body;
    const userId = req.user.id;

    if (!storeId || value === undefined) {
      return res.status(400).json({ message: "Store ID and rating value are required" });
    }

    const ratingVal = parseInt(value, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ message: "Rating value must be an integer between 1 and 5" });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if user is trying to rate their own store (in case they are store owner, but this route is protected by user role)
    // Just a sanity check:
    if (store.owner_id === userId) {
      return res.status(400).json({ message: "You cannot rate your own store" });
    }

    // Check if user already submitted a rating
    const existingRating = await Rating.findOne({
      where: { user_id: userId, store_id: storeId },
    });

    if (existingRating) {
      return res.status(400).json({
        message: "You have already rated this store. Please modify your existing rating instead.",
      });
    }

    const newRating = await Rating.create({
      user_id: userId,
      store_id: storeId,
      value: ratingVal,
    });

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    console.error("Submit Rating Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Modify an existing rating
// @route   PUT /api/user/ratings/:storeId
// @access  Private/User
export const modifyRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    if (value === undefined) {
      return res.status(400).json({ message: "Rating value is required" });
    }

    const ratingVal = parseInt(value, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ message: "Rating value must be an integer between 1 and 5" });
    }

    const rating = await Rating.findOne({
      where: { user_id: userId, store_id: storeId },
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found. Please submit a rating first." });
    }

    rating.value = ratingVal;
    await rating.save();

    res.status(200).json({
      message: "Rating updated successfully",
      rating,
    });
  } catch (error) {
    console.error("Modify Rating Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
