import { config } from "dotenv";
import Joi from "joi";

config();

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test", "provision")
    .default("development"),
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  WALLET_SECRET: Joi.string().required(),
  ETH_PROVIDER_URL: Joi.string().required(),
  DB_URL: Joi.string().required().description("Database connection URL"),
  DB_DIALECT: Joi.string().required().description("Database type"),
  BTC_NETWORK: Joi.string().required(),
  ETH_CHAIN_ID: Joi.number().required(),
  UNISWAP_V2_EXCHANGE_ADDRESS: Joi.string().required(),
})
  .unknown()
  .required();

const { error, value } = schema.validate(process.env);

if (error) throw error;

export const env = value.NODE_ENV;
export const port = parseInt(value.PORT);
export const dbURL = value.DB_URL;
export const jwtSecret = value.JWT_SECRET;
export const walletSecret = value.WALLET_SECRET;
export const dialect = value.DB_DIALECT;
export const devEnv = env === "development";
export const ethProviderUrl = value.ETH_PROVIDER_URL;
export const btcNetwork = value.BTC_NETWORK;
export const ethChainId = value.ETH_CHAIN_ID;
export const uniswapV2ExchangeAddress = value.UNISWAP_V2_EXCHANGE_ADDRESS;
