import { AuthController } from "./auth.controller";
import { ChatWebSocket } from "./chat.websocket";

export const controllers = [AuthController];

export const wsControllers = [ChatWebSocket];
