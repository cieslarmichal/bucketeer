import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface CreateBucketCommandHandlerPayload {
  readonly bucketName: string;
}

export type CreateBucketCommandHandler = CommandHandler<CreateBucketCommandHandlerPayload, void>;
