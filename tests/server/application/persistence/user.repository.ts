import { UserRoot } from "../../domain/user/user.root";

export interface IUserRepository {
  create(user: UserRoot): Promise<UserRoot>;
  getByAccount(account: string): Promise<UserRoot | null>;
}
