import Joi from "joi";
import passwordComplexity from "joi-password-complexity";
const JoiPhone = Joi.extend(require("joi-phone-number"));

export const signIn = {
  user: Joi.string().required(),
  password: Joi.string().required(),
};

export const signUp = {
  role: Joi.string().required().valid("user"),
  email: Joi.string().email().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  phone: JoiPhone.string().phoneNumber({ format: "e164" }).required(),
  othernames: Joi.string(),
  password: passwordComplexity(),
};

export const verify = {
  token: Joi.string(),
};

export const resendVerification = {
  email: Joi.string().email().required(),
};

export const initiateReset = {
  email: Joi.string().email().required(),
};

export const verifyReset = {
  token: Joi.string().required(),
};

export const updateReset = {
  token: Joi.string().required(),
  password: Joi.string(),
};
