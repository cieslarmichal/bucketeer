import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteBucketCommandHandlerPayload {
  readonly bucketName: string;
}

export type DeleteBucketCommandHandler = CommandHandler<DeleteBucketCommandHandlerPayload, void>;
