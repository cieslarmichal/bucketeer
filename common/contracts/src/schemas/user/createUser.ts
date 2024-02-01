import { type UserRole } from './userRole.js';

export interface CreateUserBody {
  readonly email: string;
  readonly password: string;
  readonly directoryName: string;
}

export interface CreateUserResponseBody {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}
