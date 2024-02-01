import {
  type FindUserDirectoryQueryHandler,
  type FindUserDirectoryQueryHandlerPayload,
  type FindUserDirectoryQueryHandlerResult,
} from './findUserDirectoryQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUserDirectoryQueryHandlerImpl implements FindUserDirectoryQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUserDirectoryQueryHandlerPayload): Promise<FindUserDirectoryQueryHandlerResult> {
    const { userId } = payload;

    const directoryName = await this.userRepository.findUserDirectory({ userId });

    if (!directoryName) {
      throw new ResourceNotFoundError({
        name: 'UserDirectory',
        userId,
      });
    }

    return { directoryName };
  }
}
