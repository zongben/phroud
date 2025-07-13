import bcrypt from "bcrypt";

export function hash(
  data: string,
  saltRound: number | string = 10,
): Promise<string> {
  return bcrypt.hash(data, saltRound);
}

export function compare(data: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(data, hashed);
}
