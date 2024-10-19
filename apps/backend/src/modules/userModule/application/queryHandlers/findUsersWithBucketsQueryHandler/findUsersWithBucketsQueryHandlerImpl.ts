import {
  type FindUsersWithBucketsQueryHandler,
  type FindUsersWithBucketsQueryHandlerPayload,
  type FindUsersWithBucketsQueryHandlerResult,
} from './findUsersWithBucketsQueryHandler.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUsersWithBucketsQueryHandlerImpl implements FindUsersWithBucketsQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(
    payload: FindUsersWithBucketsQueryHandlerPayload,
  ): Promise<FindUsersWithBucketsQueryHandlerResult> {
    const { page, pageSize } = payload;

    const [usersWithBuckets, totalUsers] = await Promise.all([
      this.userRepository.findUsersWithBuckets({
        page,
        pageSize,
      }),
      this.userRepository.countUsers(),
    ]);

    return {
      users: usersWithBuckets,
      totalUsers,
    };
  }
}
