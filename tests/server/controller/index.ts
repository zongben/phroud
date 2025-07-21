import { AuthController } from "./auth.controller";
import { NotificationWebSocket } from "./notification.websocket";

export const controllers = [AuthController];

export const wsControllers = [NotificationWebSocket];
