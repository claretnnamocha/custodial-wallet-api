import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const JoiPhone = Joi.extend(require("joi-phone-number"));

export const signIn = {
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const signUp = {
  email: Joi.string().email().required(),
  phone: JoiPhone.string()
    .phoneNumber({
      defaultCountry: "NG",
      format: "e164",
    })
    .required(),
  firstname: Joi.string(),
  lastname: Joi.string(),
  password: passwordComplexity(),
};

export const verify = {
  token: Joi.string().default(null),
  email: Joi.string()
    .email()
    .when("token", { is: null, then: Joi.string().email().required() })
    .when("token", { not: null, then: Joi.forbidden() }),
};

export const initiateReset = {
  email: Joi.string().email().required(),
};

export const verifyReset = {
  token: Joi.string().required(),
};

export const updateReset = {
  token: Joi.string().required(),
  password: passwordComplexity(),
  logOtherDevicesOut: Joi.boolean().default(false),
};
