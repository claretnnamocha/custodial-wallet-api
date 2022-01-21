import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const updateProfile = {
  firstname: Joi.string(),
  lastname: Joi.string(),
  dob: Joi.date(),
  location: Joi.string(),
  avatar: Joi.string().uri(),
};

export const updatePassword = {
  password: Joi.string(),
  newPassword: passwordComplexity(),
  logOtherDevicesOut: Joi.boolean().default(false),
};