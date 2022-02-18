import { Provider } from "@ethersproject/abstract-provider";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Percent } from "@uniswap/sdk";
import { Token } from "@uniswap/sdk-core";
import { ChainId } from "@uniswap/smart-order-router";
import { Contract, Signer } from "ethers";
import { ethProviderUrl, uniswapV2ExchangeAddress } from "./env";

const WETH = new Token(
  ChainId.RINKEBY,
  "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  18,
  "WETH",
  "Wrapped Ether"
);

const USDC = new Token(
  ChainId.RINKEBY,
  "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
  6,
  "USDC",
  "USD Coin"
);

const USDT = new Token(
  ChainId.RINKEBY,
  "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02",
  18,
  "USDT",
  "Compound USDT"
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

export const currencies = { USDC, WETH, USDT };

export const provider = new JsonRpcProvider(ethProviderUrl);
