import { Response } from "express";
import { CustomRequest } from "../../types/controllers";
import * as wallet from "./services";

export const createWallet = async (req: CustomRequest, res: Response) => {
  const data = await wallet.createWallet(req.form);
  return data;
};

export const deleteWallet = async (req: CustomRequest, res: Response) => {
  const data = await wallet.deleteWallet(req.form);
  return data;
};

export const getAllMadeRequests = async (req: CustomRequest, res: Response) => {
  const data = await wallet.getAllMadeRequests(req.form);
  return data;
};

export const getAllReceivedRequests = async (
  req: CustomRequest,
  res: Response
) => {
  const data = await wallet.getAllReceivedRequests(req.form);
  return data;
};

export const getMyWallets = async (req: CustomRequest) => {
  const data = await wallet.getMyWallets(req.form);
  return data;
};

export const getWalletDetails = async (req: CustomRequest, res: Response) => {
  const data = await wallet.getWalletDetails(req.form);
  return data;
};

export const requestFunds = async (req: CustomRequest, res: Response) => {
  const data = await wallet.requestFunds(req.form);
  return data;
};

export const respondToRequest = async (req: CustomRequest, res: Response) => {
  const data = await wallet.respondToRequest(req.form);
  return data;
};

export const transferFunds = async (req: CustomRequest, res: Response) => {
  const data = await wallet.transferFunds(req.form);
  return data;
};

export const getLocalBanks = async (req: CustomRequest, res: Response) => {
  const data = await wallet.getLocalBanks();
  return data;
};

export const verifyLocalAccount = async (req: CustomRequest, res: Response) => {
  const data = await wallet.verifyLocalAccount(req.form);
  return data;
};

export const disburseToLocalAccount = async (
  req: CustomRequest,
  res: Response
) => {
  const data = await wallet.disburseToLocalAccount(req.form);
  return data;
};
