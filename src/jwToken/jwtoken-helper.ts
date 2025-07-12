import jwt, { JwtPayload } from "jsonwebtoken";
import { IJwTokenHelper } from "./interfaces/jwtoken-helper.interface";
import { JwTokenSettings } from "./jwtoken-settings";

export class JwTokenHelper implements IJwTokenHelper {
  constructor(private settings: JwTokenSettings) {}

  generateToken(payload: any): string {
    return jwt.sign(payload, this.settings.secret, this.settings.options);
  }

  verifyToken(token: string): boolean | JwtPayload {
    try {
      return jwt.verify(token, this.settings.secret) as JwtPayload;
    } catch {
      return false;
    }
  }
}
