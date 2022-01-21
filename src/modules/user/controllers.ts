import { Response } from "express";
import { CustomRequest } from "../../types/controllers";
import * as user from "./services";

export const getProfile = async (req: CustomRequest, res: Response) => {
  const data = await user.getProfile(req.form);
  return data;
};

export const updatePassword = async (req: CustomRequest, res: Response) => {
  const data = await user.updatePassword(req.form);
  return data;
};

export const updateProfile = async (req: CustomRequest, res: Response) => {
  const data = await user.updateProfile(req.form);
  return data;
};

export const logOtherDevicesOut = async (req: CustomRequest, res: Response) => {
  const data = await user.logOtherDevicesOut(req.form);
  return data;
};

export const signOut = async (req: CustomRequest, res: Response) => {
  const data = await user.signOut(req.form);
  return data;
};
