import { Router } from "express";
import { authenticate, controller, validate } from "../../middlewares";
import * as user from "./controller";
import * as validator from "./validators";

const routes = Router();
routes.use(authenticate);

routes.get("", controller(user.getProfile));

routes.put(
  "/change-password",
  validate(validator.changePassword),
  controller(user.changePassword)
);

routes.put(
  "/edit-profile",
  validate(validator.editProfile),
  controller(user.editProfile)
);

export default routes;
