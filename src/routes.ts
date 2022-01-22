import { Response, Router } from "express";
import { response } from "./helpers";
import { authenticate } from "./middlewares";
import auth from "./modules/auth/routes";
import user from "./modules/user/routes";

const routes = Router();

const api = Router();

routes.use("/auth", auth);

routes.use(authenticate());

routes.use("/user", user);
routes.use("/wallet", user);

api.use("/api", routes);

api.use((_, res: Response) => {
  response(res, { status: false, message: "Route not found" }, 404);
});

export default api;
