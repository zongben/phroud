import { IPublisher, ISender } from "../../public/interfaces";

export interface IMediatorMap {
  set(req: any, handler: any): void;
  get(req: any): any;
}

export interface IMediator extends ISender, IPublisher {}
