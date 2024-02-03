import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface GrantBucketAccessCommandHandlerPayload {
  readonly userId: string;
  readonly bucketName: string;
}

export type GrantBucketAccessCommandHandler = CommandHandler<GrantBucketAccessCommandHandlerPayload, void>;
