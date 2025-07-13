import { AsyncLocalStorage } from "node:async_hooks";
import { Timer } from "../public/timer";

export const timerStorage = new AsyncLocalStorage<Timer>();
