import { Response } from "express";
import { response } from "../helpers";
import { CustomRequest } from "../types/controllers";

export const controller =
  (fn: Function) => async (req: CustomRequest, res: Response) => {
    try {
      const data = await fn(req);

      return response(res, data, data.status ? 200 : 400);
    } catch (e) {
      return response(
        res,
        { status: false, message: "Internal server error" },
        500
      );
    }
  };
