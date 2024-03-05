import { type Readable } from 'node:stream';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface UploadResourceCommandHandlerPayload {
  readonly userId: string;
  readonly resourceName: string;
  readonly contentType: string;
  readonly data: Readable;
  readonly bucketName: string;
}

export type UploadResourceCommandHandler = CommandHandler<UploadResourceCommandHandlerPayload, void>;
