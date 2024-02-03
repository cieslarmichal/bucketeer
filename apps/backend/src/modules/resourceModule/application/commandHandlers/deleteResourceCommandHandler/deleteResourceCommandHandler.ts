import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteResourceCommandHandlerPayload {
  readonly userId: string;
  readonly resourceName: string;
  readonly bucketName: string;
}

export type DeleteResourceCommandHandler = CommandHandler<DeleteResourceCommandHandlerPayload, void>;
