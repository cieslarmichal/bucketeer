import { type UserRole } from './userRole.js';

export interface FindUsersQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindUsersResponseBody {
  readonly data: {
    readonly id: string;
    readonly email: string;
    readonly role: UserRole;
  }[];
  readonly metadata: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };
}
