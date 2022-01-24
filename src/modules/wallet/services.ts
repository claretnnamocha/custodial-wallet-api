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
import bitcore from "bitcore-lib";
import { Transaction as Tx } from "ethereumjs-tx";
import { BigNumber, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import fetch from "node-fetch";
import Web3 from "web3";
import {
  coinGeckMap,
  currencies,
  getTokenContract,
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
 * Swap eth to erc20 token
 * @param {wallet.Erc20ToEth} params  Request Body
 * @returns {others.Response} Contains status, message and data if any of the operation
 * @deprecated v3 auto router has unresolved issues
 */
export const ethToErc20V3 = async (
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

    const provider = new JsonRpcProvider(ethProviderUrl);

    const amountIn = parseInt(
      (tempAmount * Math.pow(10, currency.decimals)).toString()
    ).toString();

    const amount = new TokenAmount(currency, amountIn);

    const user: UserSchema = await User.findByPk(userId);
    const recipient = Web3.utils.toChecksumAddress(user.ethereumAddress);
    const { privateKey } = user.resolveAccount({});

    const signer = new Wallet(privateKey);
    const account = signer.connect(provider);

    const gasLimit = BigNumber.from(500000).toHexString();

    const contract = getTokenContract(currency.address, account);

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

    if (!currency) {
      return {
        payload: { status: false, message: "Currency not found" },
        code: 404,
      };
    }

    const amount = (tempAmount * Math.pow(10, currency.decimals)).toString();

    const provider = new JsonRpcProvider(ethProviderUrl);
    const web3 = new Web3(ethProviderUrl);
    const user: UserSchema = await User.findByPk(userId);
    const from = Web3.utils.toChecksumAddress(user.ethereumAddress);
    let { privateKey } = user.resolveAccount({});

    if (privateKey.length == 66) privateKey = privateKey.substring(2);
    const privateKeyBuffer = Buffer.from(privateKey, "hex");

    const signer = new Wallet(privateKey);
    const account = signer.connect(provider);

    let gasPrice = await web3.eth.getGasPrice();
    gasPrice = Web3.utils.toHex(gasPrice);

    const contract = getTokenContract(currency.address, account);

    let balance = await contract.balanceOf(from);
    balance = web3.utils.hexToNumberString(balance);

    if (balance < amount) {
      return {
        status: false,
        message: `You dont have enough ${tempCurrency}`,
      };
    }

    const nonce = await web3.eth.getTransactionCount(from);

    let rawTransaction: any = {
      from,
      gasPrice,
      to: currency.address,
      value: "0x0",
      data: contract.interface.encodeFunctionData("transfer", [to, amount]),
      nonce,
    };

    const gasLimit = await web3.eth.estimateGas(rawTransaction);

    let rate = gasLimit * parseInt(gasPrice);

    console.log(gasLimit, gasPrice);

    let charge: any = await getECR20Charge({ rate, currency: tempCurrency });
    const tempCharge = BigNumber.from(
      Math.ceil(charge * Math.pow(10, currency.decimals))
    ).toString();

    if (chargeFromAmount) {
      if (amount < tempCharge) {
        return {
          status: false,
          message: `Charge is greatet the amount`,
        };
      }

      let newAmount = BigNumber.from(amount)
        .sub(BigNumber.from(tempCharge))
        .toString();

      rawTransaction.data = contract.interface.encodeFunctionData("transfer", [
        to,
        newAmount,
      ]);

      rate = gasLimit * parseInt(gasPrice);
    } else {
      let newAmount = BigNumber.from(amount).add(tempCharge).toString();

      if (balance < newAmount) {
        return {
          status: false,
          message: `You dont have enough ${tempCurrency}`,
        };
      }
    }

    const { status, message }: any = await erc20ToEthV2({
      userId,
      currency: tempCurrency,
      amount: charge,
    });

    if (!status) return { status, message };

    // let transaction = new Tx(rawTransaction);

    // transaction.sign(privateKeyBuffer);

    // web3.eth.sendSignedTransaction(
    //   "0x" + transaction.serialize().toString("hex")
    // );

    await contract.transfer(to, amount);

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

const getECR20Charge = async ({ currency, rate }) => {
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
  rate = rate / Math.pow(10, 18);
  return unitPrice / rate;
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
    const amount = parseEther(tempAmount.toString());

    let tx = { to, value: amount };

    const provider = new JsonRpcProvider(ethProviderUrl);
    const web3 = new Web3(ethProviderUrl);
    const user: UserSchema = await User.findByPk(userId);
    const from = Web3.utils.toChecksumAddress(user.ethereumAddress);
    const { privateKey } = user.resolveAccount({});

    const wallet = new Wallet(privateKey, provider);
    const balance = await web3.eth.getBalance(from);

    if (balance.toString() < amount.toString()) {
      return {
        status: false,
        message: `You dont have enough ETH`,
      };
    }

    wallet.sendTransaction(tx);

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
