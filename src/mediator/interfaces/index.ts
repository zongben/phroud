export interface IPublisher {
  publish<T extends object>(event: T): Promise<void>;
}

export interface IEventHandler<T> {
  handle(event: T): Promise<void>;
}
