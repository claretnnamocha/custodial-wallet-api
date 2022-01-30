import { Router } from "express";
import { controller, validate } from "../../middlewares";
import * as wallet from "./services";
import * as validator from "./validators";

const routes = Router();

routes.post(
  "/eth-to-erc20",
  validate(validator.erc20ToEth),
  controller(wallet.ethToErc20V2)
);

routes.post(
  "/erc20-to-eth",
  validate(validator.erc20ToEth),
  controller(wallet.erc20ToEthV2)
);

routes.post(
  "/erc20-to-eth-v2",
  validate(validator.erc20ToEth),
  controller(wallet.gaslessErc20ToEth)
);

routes.post(
  "/send-ecr20",
  validate(validator.sendErc20),
  controller(wallet.sendErc20Token)
);

routes.post(
  "/send-eth",
  validate(validator.sendEth),
  controller(wallet.sendEth)
);

export default routes;
