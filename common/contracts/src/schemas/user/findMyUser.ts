import { type UserRole } from './userRole.js';

export interface FindMyUserResponseBody {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}
