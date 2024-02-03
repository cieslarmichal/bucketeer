import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface RevokeBucketAccessCommandHandlerPayload {
  readonly userId: string;
  readonly bucketName: string;
}

export type RevokeBucketAccessCommandHandler = CommandHandler<RevokeBucketAccessCommandHandlerPayload, void>;
