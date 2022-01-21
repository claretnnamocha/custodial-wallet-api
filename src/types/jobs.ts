import Bull from "bull";

export interface create {
  queueName: string;
  options?: Bull.QueueOptions;
}

export interface add {
  queue: Bull.Queue;
  queueName?: string;
  data: any;
  options?: Bull.JobOptions;
}

export interface process {
  queue: Bull.Queue;
  queueName?: string;
  concurrency?: number;
  callback: Bull.ProcessCallbackFunction<any>;
}

type eventTypes =
  | "error"
  | "waiting"
  | "active"
  | "stalled"
  | "progress"
  | "completed"
  | "failed"
  | "paused"
  | "resumed"
  | "cleaned"
  | "drained"
  | "removed";

export interface event {
  queue: Bull.Queue;
  event?: eventTypes;
  callback: Bull.ProcessCallbackFunction<any>;
}
