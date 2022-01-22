import Web3 from "web3";
import { devEnv, ethProviderUrl } from "../../configs/env";
import { User } from "../../models";
import { UserSchema } from "../../types/models";
import { others, wallet } from "../../types/services";

const generateEthereumAddress = () => {
  const provider = new Web3.providers.HttpProvider(ethProviderUrl);
  const web3 = new Web3(provider);
  const ethereumAccount = web3.eth.accounts.create();

  delete ethereumAccount.encrypt;
  delete ethereumAccount.sign;
  delete ethereumAccount.signTransaction;
  return ethereumAccount;
};

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

    const ethereumAccount = generateEthereumAddress();

    const user: UserSchema = await User.findByPk(userId);

    await user.update({
      ethereumAccount,
      ethereumAddress: ethereumAccount.address,
    });

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
