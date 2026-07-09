import { sequelize, User, Store, Rating } from "../models/index.js";

// @desc    Get store owner dashboard stats and raters list
// @route   GET /api/owner/dashboard
// @access  Private/StoreOwner
export const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the store owned by this user
    const store = await Store.findOne({
      where: { owner_id: userId },
    });

    if (!store) {
      return res.status(200).json({
        hasStore: false,
        message: "No store registered under this account yet. Please contact the administrator.",
        averageRating: 0,
        ratings: [],
      });
    }

    // Get average rating
    const avgRatingResult = await Rating.findOne({
      where: { store_id: store.id },
      attributes: [[sequelize.fn("AVG", sequelize.col("value")), "avgRating"]],
    });
    const avgRating = avgRatingResult ? avgRatingResult.get("avgRating") : 0;

    // Get list of users who have rated the store
    const ratings = await Rating.findAll({
      where: { store_id: store.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "address"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: avgRating ? parseFloat(parseFloat(avgRating).toFixed(1)) : 0,
      ratings: ratings.map((r) => ({
        id: r.id,
        value: r.value,
        createdAt: r.createdAt,
        user: r.user,
      })),
    });
  } catch (error) {
    console.error("Get Owner Dashboard Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
