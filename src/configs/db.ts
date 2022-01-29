import bitcore from "bitcore-lib";
import { Sequelize, SequelizeScopeError } from "sequelize";
import { v4 as uuid } from "uuid";
import Web3 from "web3";
import { ethProviderUrl } from "../configs/env";
import { btcNetwork, dbURL, dialect } from "./env";

const dialectOptions = dbURL.includes("localhost")
  ? {}
  : { ssl: { require: true, rejectUnauthorized: false } };

export const db = new Sequelize(dbURL, {
  dialectOptions,
  logging: false,
});

const seed = async (models: any) => {
  console.log("DB cleared");
};

export const authenticate = ({ clear = false }) => {
  db.authenticate()
    .then(async () => {
      console.log("Connection to Database has been established successfully.");
      const models = require("../models");
      const opts = clear ? { force: true } : { alter: true };
      for (let schema in models) await models[schema].sync(opts);
      if (clear) await seed(models);
      console.log("Migrated");
    })
    .catch((error: SequelizeScopeError) =>
      console.error("Unable to connect to the database: " + error.message)
    );
};
