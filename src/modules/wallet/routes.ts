import { Router } from "express";
import { controller, validate } from "../../middlewares";
import { paginate } from "../auth/validators";
import * as wallet from "./controllers";

const routes = Router();

routes.get("/my-wallets", validate(paginate), controller(wallet.getMyWallets));

export default routes;
