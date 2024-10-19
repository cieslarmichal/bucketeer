import { type UserRole } from './userRole.js';

export interface FindUsersQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface UserBucket {
  id: string;
  userId: string;
  bucketName: string;
}

export interface UserWithBuckets {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly buckets: UserBucket[];
}

export interface FindUsersWithBucketsResponseBody {
  readonly data: Array<UserWithBuckets>;
  readonly metadata: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };
}
