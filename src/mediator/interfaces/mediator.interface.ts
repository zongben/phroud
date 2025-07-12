import { IPublisher } from "./publisher.interface";
import { ISender } from "./sender.interface";

export interface IMediator extends ISender, IPublisher {}
