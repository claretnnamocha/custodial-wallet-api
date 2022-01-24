import { JsonRpcProvider } from "@ethersproject/providers";
import {
  Fetcher,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
  WETH,
} from "@uniswap/sdk";
import { MaxUint256 } from "@uniswap/sdk-core";
// import { Currency, TradeType } from "@uniswap/sdk-core";
// import { AlphaRouter, ChainId, parseAmount } from "@uniswap/smart-order-router";
import bitcore from "bitcore-lib";
import { BigNumber, Wallet } from "ethers";
import Web3 from "web3";
import {
  currencies,
  getContract,
  getUniswapContract,
  slippageTolerance,
  TWENTY_MINS_AHEAD,
} from "../../configs/constants";
import {
  btcNetwork,
  devEnv,
  ethChainId,
  ethProviderUrl,
  uniswapV2ExchangeAddress,
} from "../../configs/env";
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

const generateBitcoinAddress = () => {
  bitcore.Networks["defaultNetwork"] = bitcore.Networks[btcNetwork];

  let privateKey: bitcore.PrivateKey | string = new bitcore.PrivateKey();
  const wif = privateKey.toWIF();
  const address = privateKey.toAddress().toString();
  privateKey = privateKey.toString();

  return { wif, address, privateKey };
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
    const bitcoinAccount = generateBitcoinAddress();

    const user: UserSchema = await User.findByPk(userId);

    await user.update({
      ethereumAccount,
      ethereumAddress: ethereumAccount.address,
      bitcoinAccount,
      bitcoinAddress: bitcoinAccount.address,
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
 * Tranfer
 * @param {wallet.CreateRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const transfer = async (
  params: wallet.CreateRequest
): Promise<others.Response> => {
  try {
    const { userId } = params;

    const ethereumAccount = generateEthereumAddress();
    const bitcoinAccount = generateBitcoinAddress();

    const user: UserSchema = await User.findByPk(userId);

    await user.update({
      ethereumAccount,
      ethereumAddress: ethereumAccount.address,
      bitcoinAccount,
      bitcoinAddress: bitcoinAccount.address,
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
 * Swap eth to erc20 token
 * @param {wallet.GetRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 * @deprecated v3 auto router has unresolved issues
 */
export const EthToErc20V3 = async (
  params: wallet.Erc20ToEth
): Promise<others.Response> => {
  try {
    // const { currency: tempCurrency, amount: tempAmount, userId } = params;
    // const currency: Currency = currencies[tempCurrency];
    // if (!currency) {
    //   return {
    //     payload: { status: false, message: "Currency not found" },
    //     code: 404,
    //   };
    // }
    // const amount = parseAmount(
    //   (tempAmount * Math.pow(10, currency.decimals)).toString(),
    //   currency
    // );
    // const user: UserSchema = await User.findByPk(userId);
    // const recipient = Web3.utils.toChecksumAddress(user.ethereumAddress);
    // const router = new AlphaRouter({
    //   chainId: ChainId.RINKEBY,
    //   provider: new JsonRpcProvider(ethProviderUrl),
    // });
    // console.log({
    //   amount,
    //   currency,
    //   tradeType: TradeType.EXACT_INPUT,
    // });
    // // Error after this line <-
    // const route = await router.route(amount, currency, TradeType.EXACT_INPUT);
    // const transaction = {
    //   data: route.methodParameters.calldata,
    //   to: uniswapRouterContract,
    //   value: route.methodParameters.value,
    //   from: recipient,
    //   gasPrice: route.gasPriceWei.toString(),
    // };
    // const provider = new Web3.providers.HttpProvider(ethProviderUrl);
    // const web3 = new Web3(provider);
    // web3.eth.sendTransaction(transaction);
    // console.log("done");
  } catch (error) {
    return {
      status: false,
      message: "Error trying to swap erc20 token to eth".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Swap eth to erc20 token
 * @param {wallet.GetRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const EthToErc20V2 = async (
  params: wallet.Erc20ToEth
): Promise<others.Response> => {
  try {
    const { currency: tempCurrency, amount: tempAmount, userId } = params;

    const currency: Token = currencies[tempCurrency];

    if (!currency) {
      return {
        payload: { status: false, message: "Currency not found" },
        code: 404,
      };
    }
    const weth = WETH[ethChainId];

    const provider = new JsonRpcProvider(ethProviderUrl);

    const amount = new TokenAmount(
      weth,
      (tempAmount * Math.pow(10, weth.decimals)).toString()
    );

    const user: UserSchema = await User.findByPk(userId);
    const recipient = Web3.utils.toChecksumAddress(user.ethereumAddress);
    const { privateKey } = user.resolveAccount({});

    const pair = await Fetcher.fetchPairData(currency, weth, provider);
    const route = new Route([pair], weth);

    const trade = new Trade(route, amount, TradeType.EXACT_INPUT);

    let amountOutMin: any = trade.minimumAmountOut(slippageTolerance).raw;
    amountOutMin = BigNumber.from(amountOutMin.toString()).toHexString();

    const path = [weth.address, currency.address];
    const deadline = TWENTY_MINS_AHEAD();

    let inputAmount: any = trade.inputAmount.raw;
    inputAmount = BigNumber.from(inputAmount.toString()).toHexString();

    const signer = new Wallet(privateKey);
    const account = signer.connect(provider);

    const uniswap = getUniswapContract(account);

    const gasPrice = (await provider.getGasPrice()).toHexString();
    const gasLimit = BigNumber.from(500000).toHexString();

    await uniswap.swapExactETHForTokens(
      amountOutMin,
      path,
      recipient,
      deadline,
      { value: inputAmount, gasPrice, gasLimit }
    );

    return {
      status: true,
      message: `Successfully swapped ${tempAmount} ETH for ${tempCurrency}`,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to swap erc20 token to eth".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Swap erc20 token to eth
 * @param {wallet.GetRequest} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const Erc20ToEthV2 = async (
  params: wallet.Erc20ToEth
): Promise<others.Response> => {
  try {
    const { currency: tempCurrency, amount: tempAmount, userId } = params;

    const currency: Token = currencies[tempCurrency];

    if (!currency) {
      return {
        payload: { status: false, message: "Currency not found" },
        code: 404,
      };
    }

    const weth = WETH[ethChainId];

    const provider = new JsonRpcProvider(ethProviderUrl);

    const amount = new TokenAmount(
      currency,
      (tempAmount * Math.pow(10, currency.decimals)).toString()
    );

    const amountIn = (tempAmount * Math.pow(10, currency.decimals)).toString();

    const user: UserSchema = await User.findByPk(userId);
    const recipient = Web3.utils.toChecksumAddress(user.ethereumAddress);
    const { privateKey } = user.resolveAccount({});

    const signer = new Wallet(privateKey);
    const account = signer.connect(provider);

    const gasLimit = BigNumber.from(500000).toHexString();

    const contract = getContract(currency.address, account);

    await contract.transferFrom(recipient, uniswapV2ExchangeAddress, amountIn, {
      gasLimit,
    });

    await contract.approve(uniswapV2ExchangeAddress, MaxUint256.toString());

    const pair = await Fetcher.fetchPairData(currency, weth, provider);

    const route = new Route([pair], weth);

    const trade = new Trade(route, amount, TradeType.EXACT_OUTPUT);

    let amountOutMin: any = trade.minimumAmountOut(slippageTolerance).raw;
    amountOutMin = BigNumber.from(amountOutMin.toString()).toHexString();

    const path = [currency.address, weth.address];
    const deadline = TWENTY_MINS_AHEAD();

    const uniswap = getUniswapContract(account);

    const gasPrice = (await provider.getGasPrice()).toHexString();

    await uniswap.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      path,
      recipient,
      deadline,
      { gasPrice, gasLimit }
    );

    return {
      status: true,
      message: `Successfully swapped ${tempAmount} ${tempCurrency} for ETH`,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to swap erc20 token to eth".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};
