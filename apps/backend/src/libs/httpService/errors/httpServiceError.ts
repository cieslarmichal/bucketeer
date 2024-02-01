import { ApplicationError } from '../../../common/errors/base/applicationError.js';

interface Context {
  readonly name?: string;
  readonly message: string;
}

export class HttpServiceError extends ApplicationError<Context> {
  public constructor(context: Context) {
    super('HttpServiceError', 'Http service error.', context);
  }
}
