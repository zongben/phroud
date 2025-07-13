import { AsyncLocalStorage } from "node:async_hooks";
import { Timer } from "../timer";

export const timerStorage = new AsyncLocalStorage<Timer>();
