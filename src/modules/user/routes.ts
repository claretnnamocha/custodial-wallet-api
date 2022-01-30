import { Router } from "express";
import { controller, validate } from "../../middlewares";
import * as user from "./services";
import * as validator from "./validators";

const routes = Router();

routes.get("/", controller(user.getProfile));

routes.put(
  "/update-password",
  validate(validator.updatePassword),
  controller(user.updatePassword)
);

routes.put(
  "/update-profile",
  validate(validator.updateProfile),
  controller(user.updateProfile)
);

routes.post("/log-other-devices-out", controller(user.logOtherDevicesOut));

routes.post("/sign-out", controller(user.signOut));

export default routes;
