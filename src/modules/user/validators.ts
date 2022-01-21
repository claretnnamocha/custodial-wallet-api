import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const changePassword = {
  oldPassword: Joi.string().required(),
  password: passwordComplexity(),
};

export const editProfile = {
  username: Joi.string(),
  // email: Joi.string().email(),
  firstname: Joi.string(),
  dob: Joi.date(),
  country: Joi.string(),
  preferredLanguage: Joi.string(),
  currency: Joi.string(),
  lastname: Joi.string(),
  othernames: Joi.string(),
  avatar: Joi.string().uri(),
  addresses: Joi.array().items(
    Joi.object()
      .keys({
        country: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        no: Joi.string().required(),
        street: Joi.string().required(),
        landmark: Joi.string().required(),
      })
      .unknown(false)
  ),
};
