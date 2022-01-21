import Bull from "bull";
import { jobs } from "../types";

export const create = ({ queueName, options = {} }: jobs.create): Bull.Queue =>
  new Bull(queueName, options);
