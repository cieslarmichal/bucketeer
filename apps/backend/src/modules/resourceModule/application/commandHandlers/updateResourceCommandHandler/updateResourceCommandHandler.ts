import { type UserRole } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface UpdateResourceCommandHandlerPayload {
  readonly userId: string;
  readonly userRole: UserRole;
  readonly bucketName: string;
  readonly resourceId: string;
  readonly resourceName: string;
}

export type UpdateResourceCommandHandler = CommandHandler<UpdateResourceCommandHandlerPayload, void>;
