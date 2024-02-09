import { type DeleteUserCommandHandler, type DeleteUserCommandHandlerPayload } from './deleteUserCommandHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class DeleteUserCommandHandlerImpl implements DeleteUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteUserCommandHandlerPayload): Promise<void> {
    const { userId } = payload;

    this.loggerService.debug({
      message: 'Deleting User...',
      userId,
    });

    await this.userRepository.deleteUser({ id: userId });

    this.loggerService.debug({
      message: 'User deleted.',
      userId,
    });
  }
}
