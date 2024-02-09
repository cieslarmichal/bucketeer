import {
  type FindUsersQueryHandler,
  type FindUsersQueryHandlerPayload,
  type FindUsersQueryHandlerResult,
} from './findUsersQueryHandler.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUsersQueryHandlerImpl implements FindUsersQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUsersQueryHandlerPayload): Promise<FindUsersQueryHandlerResult> {
    const { page, pageSize } = payload;

    const [users, totalUsers] = await Promise.all([
      this.userRepository.findUsers({
        page,
        pageSize,
      }),
      this.userRepository.countUsers(),
    ]);

    return {
      users,
      totalUsers,
    };
  }
}
