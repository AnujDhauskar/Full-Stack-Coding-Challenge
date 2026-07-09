import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "id",
      },
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    tableName: "ratings",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "store_id"],
      },
    ],
  }
);

export default Rating;
