import { ApiProperty } from "../../../../../../src/openapi/decorator";
import { ErrorCodes } from "../../../error-codes";

export class RegisterResult {
  @ApiProperty({
    description: "帳號",
  })
  account!: string;

  @ApiProperty({
    description: "使用者名稱",
  })
  username!: string;
}

export type RegisterError = ErrorCodes.USER_ALREADY_EXISTS;
