import bcrypt from "bcrypt";

export class Crypto {
  static hash(data: string, saltRound: number | string = 10): Promise<string> {
    return bcrypt.hash(data, saltRound);
  }

  static compare(data: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(data, hashed);
  }
}
