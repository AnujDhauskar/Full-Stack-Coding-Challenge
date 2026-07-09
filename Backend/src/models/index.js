import sequelize from "../config/database.js";
import User from "./User.js";
import Store from "./Store.js";
import Rating from "./Rating.js";

// A store belongs to a user (owner)
Store.belongsTo(User, { foreignKey: "owner_id", as: "owner" });
User.hasOne(Store, { foreignKey: "owner_id", as: "store" });

// A user can submit many ratings
User.hasMany(Rating, { foreignKey: "user_id", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "user_id", as: "user" });

// A store has many ratings
Store.hasMany(Rating, { foreignKey: "store_id", as: "ratings" });
Rating.belongsTo(Store, { foreignKey: "store_id", as: "store" });

export { sequelize, User, Store, Rating };
