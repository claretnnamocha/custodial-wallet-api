import { Response } from "express";
import { CustomRequest } from "../../types/controllers";
import * as auth from "./services";

export const signUp = async (req: CustomRequest, res: Response) => {
  const data = await auth.signUp(req.form);
  return data;
};

export const signIn = async (req: CustomRequest, res: Response) => {
  const data = await auth.signIn(req.form);
  return data;
};

export const verifyAccount = async (req: CustomRequest, res: Response) => {
  const data = await auth.verifyAccount(req.form);
  return data;
};

export const initiateReset = async (req: CustomRequest, res: Response) => {
  const data = await auth.initiateReset(req.form);
  return data;
};

export const verifyReset = async (req: CustomRequest, res: Response) => {
  const data = await auth.verifyReset(req.form);
  return data;
};

export const resetPassword = async (req: CustomRequest, res: Response) => {
  const data = await auth.resetPassword(req.form);
  return data;
};
