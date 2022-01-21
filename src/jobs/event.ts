import Bull from "bull";
import { jobs } from "../types";

export const event = ({ event, callback, queue }: jobs.event): Bull.Queue =>
  queue.on(event, callback);
