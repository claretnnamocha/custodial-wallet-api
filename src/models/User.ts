import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DataTypes } from "sequelize";
import { walletSecret } from "../configs/env";
import { db } from "../configs/db";

const User = db.define(
  "User",
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    firstname: { type: DataTypes.STRING },
    lastname: { type: DataTypes.STRING },
    othernames: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    ethereumAddress: { type: DataTypes.STRING },
    bitcoinAddress: { type: DataTypes.STRING },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
      values: ["user", "admin"],
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: false,
    },
    phone: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    password: {
      type: DataTypes.STRING,
      set(value: string) {
        const salt = bcrypt.genSaltSync();
        this.setDataValue("password", bcrypt.hashSync(value, salt));
      },
    },
    ethereumAccount: {
      type: DataTypes.TEXT,
      set(value: string) {
        this.setDataValue("ethereumAccount", jwt.sign(value, walletSecret));
      },
    },
    bitcoinAccount: {
      type: DataTypes.TEXT,
      set(value: string) {
        this.setDataValue("bitcoinAccount", jwt.sign(value, walletSecret));
      },
    },
    gender: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATE },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
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
    loginValidFrom: {
      type: DataTypes.STRING,
      defaultValue: Date.now(),
      allowNull: false,
    },
  },
  { timestamps: true, tableName: "user" }
);

User.prototype.toJSON = function () {
  const data = this.dataValues;

  delete data.password;
  delete data.isDeleted;
  delete data.active;
  delete data.role;
  delete data.permissions;
  delete data.loginValidFrom;
  delete data.ethereumAccount;
  delete data.bitcoinAccount;

  return data;
};

User.prototype.validatePassword = function (val: string) {
  return bcrypt.compareSync(val, this.getDataValue("password"));
};

User.prototype.resolveAccount = function ({ account = "ethereum" }) {
  return jwt.verify(this.getDataValue(`${account}Account`), walletSecret);
};

export { User };
