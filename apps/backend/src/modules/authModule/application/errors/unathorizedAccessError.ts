import { ApplicationError } from '../../../../common/errors/base/applicationError.js';
import { type SecurityMode } from '../../../../common/types/http/securityMode.js';

interface Context {
  readonly securityMode: SecurityMode;
  readonly reason: string;
}

export class UnauthorizedAccessError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('UnauthorizedAccessError', 'Not authorized to perform this action.', context);
  }
}
