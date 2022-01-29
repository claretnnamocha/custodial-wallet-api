import { DataTypes } from "sequelize";
import { db } from "../configs/db";

const ApprovedAddress = db.define(
  "ApprovedAddress",
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    ethereumAddress: { type: DataTypes.STRING },
  },
  { timestamps: true, tableName: "approveAddress" }
);

export { ApprovedAddress };
