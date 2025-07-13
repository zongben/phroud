import { ErrorCodes } from "../../../error-codes";

export type RegisterResult = {
  account: string;
  username: string;
};

export type RegisterError = ErrorCodes.USER_ALREADY_EXISTS;
