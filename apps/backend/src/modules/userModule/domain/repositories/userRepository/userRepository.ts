import { type User } from '../../../domain/entities/user/user.js';
import { type UserDomainAction } from '../../entities/user/domainActions/userDomainAction.js';
import { type UserTokens } from '../../entities/userTokens/userTokens.js';

export interface CreateUserPayload {
  readonly email: string;
  readonly password: string;
  readonly role: string;
}

export interface FindUserPayload {
  readonly id?: string;
  readonly email?: string;
}

export interface FindUserTokensPayload {
  readonly userId: string;
}

export interface FindUserBucketsPayload {
  readonly userId: string;
}

export interface UpdateUserPayload {
  readonly id: string;
  readonly domainActions: UserDomainAction[];
}

export interface DeleteUserPayload {
  readonly id: string;
}

export interface UserRepository {
  createUser(input: CreateUserPayload): Promise<User>;
  findUser(input: FindUserPayload): Promise<User | null>;
  findUserTokens(input: FindUserTokensPayload): Promise<UserTokens | null>;
  findUserBuckets(input: FindUserBucketsPayload): Promise<string[]>;
  updateUser(input: UpdateUserPayload): Promise<void>;
  deleteUser(input: DeleteUserPayload): Promise<void>;
}
