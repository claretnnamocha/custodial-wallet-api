import { DataTypes } from "sequelize";
import { db } from "../configs/db";

export const Token = db.define(
  "Token",
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    UserId: { type: DataTypes.UUID },
    token: { type: DataTypes.STRING, allowNull: false },
    expires: { type: DataTypes.STRING, allowNull: false },
    medium: { type: DataTypes.STRING },
    tokenType: { type: DataTypes.STRING },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  { timestamps: true, tableName: "token" }
);
