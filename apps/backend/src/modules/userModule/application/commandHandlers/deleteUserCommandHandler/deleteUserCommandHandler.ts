import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteUserCommandHandlerPayload {
  readonly userId: string;
}

export type DeleteUserCommandHandler = CommandHandler<DeleteUserCommandHandlerPayload, void>;
