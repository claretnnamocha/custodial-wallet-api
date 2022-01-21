import { Response, Router } from "express";
import { response } from "./helpers";
import auth from "./modules/auth/routes";
import user from "./modules/user/routes";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);

routes.use((_, res: Response) => {
  response(res, { status: false, message: "Route not found" }, 404);
});

export default routes;
