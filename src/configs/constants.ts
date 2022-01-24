import { Provider } from "@ethersproject/abstract-provider";
import { Percent } from "@uniswap/sdk";
import { Token } from "@uniswap/sdk-core";
import {
  ChainId,
  USDC_RINKEBY,
  USDT_RINKEBY,
} from "@uniswap/smart-order-router";
import { Contract, Signer } from "ethers";
import Web3 from "web3";
import { uniswapV2ExchangeAddress } from "./env";

const WETH = new Token(
  ChainId.RINKEBY,
  Web3.utils.toChecksumAddress("0xc778417E063141139Fce010982780140Aa0cD5Ab"),
  18,
  "WETH",
  "Wrapped Ether"
);

export const getUniswapContract = (account: Provider | Signer) =>
  new Contract(
    uniswapV2ExchangeAddress,
    [
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    ],
    account
  );

export const getTokenContract = (address: string, account: Provider | Signer) =>
  new Contract(
    address,
    [
      "function approve(address _spender, uint256 _value) public returns (bool success)",
      "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
      "function transfer(address recipient, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
    ],
    account
  );

export const slippageTolerance = new Percent("50", "10000");

export const TWENTY_MINS_AHEAD = () => Math.floor(Date.now() / 1000) + 60 * 20;

export const coinGeckMap = { USDT: "tether", WETH: "weth", USDC: "usd-coin" };

export const currencies = { USDT: USDT_RINKEBY, WETH, USDC: USDC_RINKEBY };
