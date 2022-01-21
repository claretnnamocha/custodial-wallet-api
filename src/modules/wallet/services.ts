import { devEnv } from "../../configs/env";
import { others, wallet } from "../../types/services";

/**
 * Create user wallet
 * @param {wallet.CreateRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const createWallet = async (
  params: wallet.CreateRequest
): Promise<others.Response> => {
  try {
    const { userId } = params;

    return { status: true, message: "Wallet created" };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to create wallet".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Get all user wallets
 * @param {others.LoggedIn} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const getMyWallets = async (
  params: others.LoggedIn
): Promise<others.Response> => {
  try {
    const { userId } = params;

    const where = { "user.id": userId, isDeleted: false };

    return {
      status: true,
      message: "My wallets",
      data: [],
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to get wallets".concat(devEnv ? ": " + error : ""),
    };
  }
};

/**
 * Get user wallet
 * @param {wallet.GetRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const getWalletDetails = async (
  params: wallet.GetRequest
): Promise<others.Response> => {
  try {
    const { userId, walletId } = params;

    const data = {};

    return {
      status: true,
      message: "Wallet Details",
      data,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to get wallet".concat(devEnv ? ": " + error : ""),
    };
  }
};
