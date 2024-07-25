import { ApplicationError } from '../../../../common/errors/base/applicationError.js';

interface Context {
  readonly reason: string;
  readonly [key: string]: unknown;
}

export class ForbiddenAccessError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('ForbiddenAccessError', 'No permissions to perform this action.', context);
  }
}
