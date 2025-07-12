import { INotification } from "./notification.interface";

export interface IPublisher {
  publish<T extends INotification<T>>(event: T): Promise<void>;
}
