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
import bitcore from "bitcore-lib";
import { Transaction as Tx } from "ethereumjs-tx";
import { BigNumber, ethers, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import Web3 from "web3";
import {
  coinGeckMap,
  currencies,
  getTokenContract,
  getUniswapContract,
  provider,
  slippageTolerance,
  TWENTY_MINS_AHEAD,
} from "../../configs/constants";
import {
  btcNetwork,
  devEnv,
  ethChainId,
  ethProviderUrl,
  liquidityAdress,
  liquidityPrivateKey,
  uniswapV2ExchangeAddress,
} from "../../configs/env";
import { ApprovedAddress, User } from "../../models";
import { UserSchema } from "../../types/models";
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
 * Swap eth to erc20 token
 * @param {wallet.Erc20ToEth} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const ethToErc20V2 = async (
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

    const amount = new TokenAmount(
      weth,
      (tempAmount * Math.pow(10, weth.decimals)).toString()
    );

    const { wallet: account, ethereumAddress: recipient } = await getWallet({
      userId,
    });

    const pair = await Fetcher.fetchPairData(currency, weth, provider);
    const route = new Route([pair], weth);

    const trade = new Trade(route, amount, TradeType.EXACT_INPUT);

    let amountOutMin: any = trade.minimumAmountOut(slippageTolerance).raw;
    amountOutMin = BigNumber.from(amountOutMin).toHexString();

    const path = [weth.address, currency.address];
    const deadline = TWENTY_MINS_AHEAD();

    let inputAmount: any = trade.inputAmount.raw;
    inputAmount = BigNumber.from(inputAmount).toHexString();

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
 * @param {wallet.Erc20ToEth} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const erc20ToEthV2 = async (
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

    const amountIn = Math.floor(tempAmount * Math.pow(10, currency.decimals));

    const amount = new TokenAmount(currency, amountIn.toString());

    const { wallet: account, ethereumAddress: recipient } = await getWallet({
      userId,
    });

    const gasLimit = BigNumber.from(500000).toHexString();

    const contract = getTokenContract(currency.address, account);

    const approvedAddress = await ApprovedAddress.findOne({
      where: { ethereumAddress: recipient },
    });

    if (!approvedAddress) {
      await contract.transferFrom(
        recipient,
        uniswapV2ExchangeAddress,
        amountIn,
        { gasLimit }
      );

      await contract.approve(uniswapV2ExchangeAddress, MaxUint256.toString());

      await ApprovedAddress.create({ id: uuid(), ethereumAddress: recipient });
    }

    const pair = await Fetcher.fetchPairData(currency, weth, provider);

    const route = new Route([pair], weth);

    const trade = new Trade(route, amount, TradeType.EXACT_OUTPUT);

    const amountOutMin: any = Buffer.from(
      trade.minimumAmountOut(slippageTolerance).raw.toString()
    ).toString("hex");

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

/**
 * Gaslessly swap erc20 token to eth
 * @param {wallet.Erc20ToEth} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const gaslessErc20ToEth = async (
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

    let amount = Math.floor(tempAmount * Math.pow(10, currency.decimals));

    let ethAmount = await etherToECR20({
      rate: tempAmount,
      currency: tempCurrency,
      inverse: true,
    });

    const {
      wallet: account,
      ethereumAddress: recipient,
      privateKey,
    } = await getWallet({ userId });

    const { wallet: liquidityAccount, ethereumAddress: sender } =
      getLiquidityWallet();

    const contract = getTokenContract(currency.address, account);

    let data = contract.interface.encodeFunctionData("transfer", [
      sender,
      amount,
    ]);

    let gasPrice: BigNumber | number = await provider.getGasPrice();
    gasPrice = Math.ceil(gasPrice.toNumber());

    const balance = await contract.balanceOf(recipient);

    if (BigNumber.from(balance).lt(BigNumber.from(amount))) {
      return {
        status: false,
        message: `You dont have enough ${tempCurrency}`,
      };
    }

    const nonce = await provider.getTransactionCount(recipient);
    let erc20Tx: any = {
      from: recipient,
      to: contract.address,
      data,
      nonce,
    };

    let gasLimit: BigNumber | number = await provider.estimateGas(erc20Tx);
    gasLimit = Math.ceil(gasLimit.toNumber());
    erc20Tx.gasLimit = gasLimit.toString();

    let rate = gasLimit * gasPrice;

    erc20Tx.gasPrice = gasPrice.toString();
    let tx: Tx | string = new Tx(erc20Tx, { chain: ethChainId });

    // let privateKeyBuffer = Buffer.from(privateKey, "hex");

    // tx.sign(privateKeyBuffer);

    if (ethAmount < rate) {
      return {
        status: false,
        message: `Charge cannot be greater tha amount`,
      };
    }

    // Send ETH
    const to: string = Web3.utils.toChecksumAddress(recipient);
    let value: string | BigNumber = BigNumber.from(
      Math.floor(ethAmount).toString()
    );
    const ethBalance: BigNumber = await provider.getBalance(sender);

    if (ethBalance.lt(value)) {
      return {
        status: false,
        message: `Liquidity provider does not have enough ETH`,
      };
    }

    value = value.toString();
    const ethTx = { to, value };
    const trxn1 = await liquidityAccount.sendTransaction(ethTx);
    await trxn1.wait();

    // Send ERC20
    tx = tx.serialize().toString("hex");
    const trxn2 = await provider.sendTransaction(erc20Tx);
    await trxn2.wait();

    return {
      status: true,
      message: `Successfully swapped ${tempAmount} ${tempCurrency} for ETH without gas`,
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
 * Send ERC20 token
 * @param {wallet.SendErc20Token} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const sendErc20Token = async (
  params: wallet.SendErc20Token
): Promise<others.Response> => {
  try {
    const {
      amount: tempAmount,
      currency: tempCurrency,
      to: tempTo,
      userId,
      chargeFromAmount,
    } = params;

    const currency: Token = currencies[tempCurrency];
    const to = Web3.utils.toChecksumAddress(tempTo);

    const {
      wallet: account,
      ethereumAddress: from,
      privateKey,
    } = await getWallet({
      userId,
    });

    if (!currency) {
      return {
        payload: { status: false, message: "Currency not found" },
        code: 404,
      };
    }

    const amount = Math.floor(tempAmount * Math.pow(10, currency.decimals));

    const contract = getTokenContract(currency.address, account);

    let data = contract.interface.encodeFunctionData("transfer", [to, amount]);

    let gasPrice: BigNumber | number = await provider.getGasPrice();
    gasPrice = gasPrice.toNumber();
    gasPrice = Math.ceil(gasPrice);

    let balance = await contract.balanceOf(from);

    if (BigNumber.from(balance).lt(BigNumber.from(amount))) {
      return {
        status: false,
        message: `You dont have enough ${tempCurrency}`,
      };
    }

    let tx: any = {
      from,
      to: contract.address,
      data,
      gasPrice: ethers.utils.hexlify(gasPrice),
    };
    let gasLimit: BigNumber | number;
    gasLimit = await provider.estimateGas(tx);
    gasLimit = Math.ceil(gasLimit.toNumber());

    tx.gasLimit = ethers.utils.hexlify(gasLimit);

    let rate = gasLimit * gasPrice;

    let charge: any = await etherToECR20({ rate, currency: tempCurrency });

    const tempCharge = Math.ceil(charge * Math.pow(10, currency.decimals));
    let newAmount: BigNumber | number;

    if (chargeFromAmount) {
      if (amount < tempCharge) {
        return {
          status: false,
          message: `Charge is greater the amount`,
        };
      }

      newAmount = BigNumber.from(amount).sub(BigNumber.from(tempCharge));

      data = contract.interface.encodeFunctionData("transfer", [
        to,
        newAmount.toString(),
      ]);

      tx.data = data;

      rate = gasLimit * gasPrice;
    } else {
      newAmount = amount + tempCharge;

      if (BigNumber.from(balance).lt(BigNumber.from(newAmount))) {
        return {
          status: false,
          message: `You dont have enough ${tempCurrency}`,
        };
      }
    }

    const nonceb4Swap = await provider.getTransactionCount(from);

    const { status, message }: any = await gaslessErc20ToEth({
      userId,
      currency: tempCurrency,
      amount: charge,
    });

    const nonceAfterSwap = await provider.getTransactionCount(from);

    if (!status) return { status, message };

    tx.nonce =
      nonceAfterSwap > nonceb4Swap ? nonceAfterSwap : nonceAfterSwap + 1;
    let transaction = new Tx(tx, { chain: ethChainId });

    const privateKeyBuffer = Buffer.from(privateKey, "hex");

    transaction.sign(privateKeyBuffer);

    await provider.sendTransaction(
      "0x" + transaction.serialize().toString("hex")
    );

    return {
      status: true,
      message: `Successfully transffered ${tempAmount} ${tempCurrency} to ${to}`,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to send erc20 token".concat(
        devEnv ? ": " + error : ""
      ),
    };
  }
};

/**
 * Send ETH
 * @param {wallet.SendErc20Token} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 */
export const sendEth = async (
  params: wallet.SendErc20Token
): Promise<others.Response> => {
  try {
    const { amount: tempAmount, to: tempTo, userId } = params;

    const to = Web3.utils.toChecksumAddress(tempTo);
    const value = parseEther(tempAmount.toString());

    const tx = { to, value };

    const { wallet, ethereumAddress } = await getWallet({
      userId,
    });

    const balance = await provider.getBalance(ethereumAddress);

    if (BigNumber.from(balance).lt(BigNumber.from(value))) {
      return {
        status: false,
        message: `You dont have enough ETH`,
      };
    }

    await wallet.sendTransaction(tx);

    return {
      status: true,
      message: `Successfully transferred ${tempAmount} ETH to ${to}`,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error trying to send eth".concat(devEnv ? ": " + error : ""),
    };
  }
};

// ---------------------------
// Helpers
// ---------------------------

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

const etherToECR20 = async ({ currency, rate, inverse = false }) => {
  let res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckMap[currency]}&vs_currencies=usd`
  );
  const {
    [coinGeckMap[currency]]: { usd: quote },
  }: any = await res.json();

  res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
  );
  const {
    ethereum: { usd: base },
  }: any = await res.json();

  const unitPrice = quote / base;

  return inverse
    ? unitPrice * rate * Math.pow(10, 18)
    : unitPrice / (rate / Math.pow(10, 18));
};

const getWallet = async ({ userId }) => {
  const user: UserSchema = await User.findByPk(userId);
  const ethereumAddress = Web3.utils.toChecksumAddress(user.ethereumAddress);
  let { privateKey } = user.resolveAccount({});

  if (privateKey.length == 66) privateKey = privateKey.substring(2);

  const wallet = new Wallet(privateKey).connect(provider);

  return { ethereumAddress, privateKey, wallet };
};

const getLiquidityWallet = () => {
  const ethereumAddress = Web3.utils.toChecksumAddress(liquidityAdress);
  let privateKey = liquidityPrivateKey;

  if (privateKey.length == 66) privateKey = privateKey.substring(2);

  const wallet = new Wallet(privateKey).connect(provider);

  return { ethereumAddress, privateKey, wallet };
};
