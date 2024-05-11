import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type AttachedFile } from '../../../../../common/types/http/httpRequest.js';

export interface UploadResourcesCommandHandlerPayload {
  readonly userId: string;
  readonly bucketName: string;
  readonly files: AttachedFile[];
}

export type UploadResourcesCommandHandler = CommandHandler<UploadResourcesCommandHandlerPayload, void>;
