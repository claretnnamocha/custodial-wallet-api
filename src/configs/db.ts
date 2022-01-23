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

  // eth
  const provider = new Web3.providers.HttpProvider(ethProviderUrl);
  const web3 = new Web3(provider);
  const { address, privateKey } = web3.eth.accounts.create();

  // btc
  bitcore.Networks["defaultNetwork"] = bitcore.Networks[btcNetwork];
  let btcPrivateKey: bitcore.PrivateKey | string = new bitcore.PrivateKey();
  const wif = btcPrivateKey.toWIF();
  const btcAddress = btcPrivateKey.toAddress().toString();
  btcPrivateKey = btcPrivateKey.toString();

  await models.User.create({
    id: uuid(),
    email: "test@claretnnamocha.com",
    firstname: "Claret",
    lastname: "Nnamocha",
    password: "Password123!",
    verifiedemail: true,
    ethereumAccount: { address, privateKey },
    ethereumAddress: address,
    bitcoinAccount: { address: btcAddress, privateKey: btcPrivateKey, wif },
    bitcoinAddress: btcAddress,
  });

  console.log("Seeded");
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
