import { SendEmail } from "./subscribers";
import { LoginHandler } from "./use-case/command/login/login.handler";
import { RegisterHandler } from "./use-case/command/register/register.handler";

export const handlers = [LoginHandler, RegisterHandler, SendEmail];
