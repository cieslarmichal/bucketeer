import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface CreateUserCommandHandlerPayload {
  readonly email: string;
  readonly password: string;
}

export interface CreateUserCommandHandlerResult {
  readonly user: User;
}

export type CreateUserCommandHandler = CommandHandler<CreateUserCommandHandlerPayload, CreateUserCommandHandlerResult>;
