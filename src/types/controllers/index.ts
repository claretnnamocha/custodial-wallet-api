import { Request } from "express";

interface RequestInterface {
  form: any;
}

export interface CustomRequest
  extends Request<RequestInterface>,
    RequestInterface {}
