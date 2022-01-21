import bcrypt from "bcryptjs";
import { DataTypes, Sequelize } from "sequelize";
import { db } from "../configs/db";

const User = db.define(
  "User",
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    address: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    firstname: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    othernames: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATE },
    avatar: { type: DataTypes.STRING },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
      values: ["user", "admin"],
    },
    password: {
      type: DataTypes.STRING,
      set(value: string) {
        const salt = bcrypt.genSaltSync();
        this.setDataValue("password", bcrypt.hashSync(value, salt));
      },
    },
    gender: { type: DataTypes.STRING },
    verifiedemail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    verifiedphone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  { timestamps: true, tableName: "user" }
);

User.prototype.transform = function () {
  let data = this.dataValues;

  delete data.password;
  return data;
};

export { User };
