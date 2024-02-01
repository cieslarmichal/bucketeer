import { type UserRole } from './userRole.js';

export interface FindUserPathParams {
  readonly id: string;
}

export interface FindUserResponseBody {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}
