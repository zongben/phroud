import { IEventHandler } from "./event-handler.interface";

export interface INotification<T> {
  getSubscribers(): Array<new (...args: any[]) => IEventHandler<T>>;
}
