import { Router } from "express";
import { controller, validate } from "../../middlewares";
import * as auth from "./controller";
import * as validator from "./validators";

const routes = Router();

routes.post("/sign-up", validate(validator.signUp), controller(auth.signUp));

routes.post("/sign-in", validate(validator.signIn), controller(auth.signIn));

routes.get(
  "/verify",
  validate(validator.verify),
  controller(auth.verifyAccount)
);

routes.get(
  "/resend-verification",
  validate(validator.resendVerification),
  controller(auth.resendVerificationAccount)
);

routes.post(
  "/initiate-reset",
  validate(validator.initiateReset),
  controller(auth.initiateReset)
);

routes.get(
  "/verify-reset",
  validate(validator.verifyReset),
  controller(auth.verifyReset)
);

routes.put(
  "/reset-password",
  validate(validator.updateReset),
  controller(auth.resetPassword)
);

export default routes;
