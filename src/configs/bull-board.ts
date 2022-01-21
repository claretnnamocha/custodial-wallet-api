import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import * as queues from "../jobs/queues";

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: Object.values(queues).map((q) => new BullAdapter(q)),
  serverAdapter,
});

serverAdapter.setBasePath("/bull-board");

export const adapter = serverAdapter;
