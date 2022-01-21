import { config } from "dotenv";
import Joi from "joi";

config();

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test", "provision")
    .default("development"),
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required(),
  DB_URL: Joi.string().required().description("Database connection URL"),
  DB_DIALECT: Joi.string().required().description("Database type"),
})
  .unknown()
  .required();

const { error, value } = schema.validate(process.env);

if (error) throw error;

export const env = value.NODE_ENV;
export const port = value.PORT;
export const dbURL = value.DB_URL;
export const jwtSecret = value.JWT_SECRET;
export const jwtExpirationTime = value.JWT_EXPIRATION_TIME;
export const dialect = value.DB_DIALECT;
