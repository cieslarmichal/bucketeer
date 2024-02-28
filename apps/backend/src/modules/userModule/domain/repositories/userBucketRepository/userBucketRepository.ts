import { type UserBucket } from '../../entities/userBucket/userBucket.js';

export interface CreateUserBucketPayload {
  readonly userId: string;
  readonly bucketName: string;
}

export interface FindUserBucketsPayload {
  readonly userId: string;
}

export interface DeleteUserBucketPayload {
  readonly bucketName: string;
}

export interface UserBucketRepository {
  createUserBucket(input: CreateUserBucketPayload): Promise<UserBucket>;
  findUserBuckets(input: FindUserBucketsPayload): Promise<UserBucket[]>;
  deleteUserBucket(input: DeleteUserBucketPayload): Promise<void>;
}
