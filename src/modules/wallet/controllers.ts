import { Response } from "express";
import { CustomRequest } from "../../types/controllers";
import * as wallet from "./services";

export const ethToErc20 = async (req: CustomRequest, res: Response) => {
  const data = await wallet.ethToErc20V2(req.form);
  return data;
};

export const erc20ToEth = async (req: CustomRequest, res: Response) => {
  const data = await wallet.erc20ToEthV2(req.form);
  return data;
};

export const sendErc20Token = async (req: CustomRequest, res: Response) => {
  const data = await wallet.sendErc20Token(req.form);
  return data;
};

export const sendEth = async (req: CustomRequest, res: Response) => {
  const data = await wallet.sendEth(req.form);
  return data;
};
