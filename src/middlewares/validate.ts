import { NextFunction, Response } from "express";
import Joi from "joi";
import { response } from "../helpers";
import { CustomRequest } from "../types/controllers";

export const validate =
  (fields: object) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys(fields).required().unknown(false);
    const value = req.method == "GET" ? req.query : req.body;
    const { error, value: vars } = schema.validate(value);

    if (error)
      return response(res, { status: false, message: error.message }, 400);

    req.form = req.form || {};

    req.form = { ...req.form, ...vars };

    next();
  };
