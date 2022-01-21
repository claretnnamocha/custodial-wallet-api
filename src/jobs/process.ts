import { jobs } from "../types";

export const process = async ({
  queueName = "_default_",
  concurrency = 1,
  queue,
  callback,
}: jobs.process): Promise<void> =>
  queue.process(queueName, concurrency, callback);
