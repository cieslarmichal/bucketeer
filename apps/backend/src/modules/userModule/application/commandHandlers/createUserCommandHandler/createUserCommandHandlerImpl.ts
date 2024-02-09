import { UserRole } from '@common/contracts';

import {
  type CreateUserCommandHandler,
  type CreateUserCommandHandlerPayload,
  type CreateUserCommandHandlerResult,
} from './createUserCommandHandler.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { type HashService } from '../../services/hashService/hashService.js';
import { type PasswordValidationService } from '../../services/passwordValidationService/passwordValidationService.js';

export class CrateUserCommandHandlerImpl implements CreateUserCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly loggerService: LoggerService,
    private readonly passwordValidationService: PasswordValidationService,
  ) {}

  public async execute(payload: CreateUserCommandHandlerPayload): Promise<CreateUserCommandHandlerResult> {
    const { email: emailInput, password } = payload;

    const email = emailInput.toLowerCase();

    this.loggerService.debug({
      message: 'Creating User...',
      email,
    });

    const existingUser = await this.userRepository.findUser({ email });

    if (existingUser) {
      throw new ResourceAlreadyExistsError({
        name: 'User',
        email,
      });
    }

    this.passwordValidationService.validate({ password });

    const hashedPassword = await this.hashService.hash({ plainData: password });

    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
      role: UserRole.user,
    });

    this.loggerService.debug({
      message: 'User created.',
      userId: user.getId(),
      email,
    });

    return { user };
  }
}
