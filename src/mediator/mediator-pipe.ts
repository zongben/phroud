import { injectable } from "inversify";

@injectable()
export abstract class MediatorPipe {
  abstract handle(req: any, next: any): Promise<any>;
}
