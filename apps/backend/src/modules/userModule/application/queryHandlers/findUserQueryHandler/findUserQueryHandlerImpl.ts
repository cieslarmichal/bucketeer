import {
  type FindUserQueryHandler,
  type FindUserQueryHandlerPayload,
  type FindUserQueryHandlerResult,
} from './findUserQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUserQueryHandlerImpl implements FindUserQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUserQueryHandlerPayload): Promise<FindUserQueryHandlerResult> {
    const { userId } = payload;

    const user = await this.userRepository.findUser({ id: userId });

    if (!user) {
      throw new ResourceNotFoundError({
        name: 'User',
        id: userId,
      });
    }

    return { user };
  }
}
