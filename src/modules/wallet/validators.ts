import Joi from "joi";

export const erc20ToEth = {
  amount: Joi.number()
    .greater(1 / Math.pow(10, 18))
    .required(),
  currency: Joi.string().required(),
};

export const sendErc20 = {
  amount: Joi.number()
    .greater(1 / Math.pow(10, 18))
    .required(),
  currency: Joi.string().required(),
  to: Joi.string().required(),
  chargeFromAmount: Joi.boolean().default(false),
};

export const sendEth = {
  amount: Joi.number()
    .greater(1 / Math.pow(10, 18))
    .required(),
  to: Joi.string().required(),
};
