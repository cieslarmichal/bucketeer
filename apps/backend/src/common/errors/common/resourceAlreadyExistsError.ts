import { BaseError } from '../base/baseError.js';

interface Context {
  readonly name: string;
  [key: string]: unknown;
}

export class ResourceAlreadyExistsError extends BaseError<Context> {
  public constructor(context: Context) {
    super('ResourceAlreadyExistsError', 'Resource already exists.', context);
  }
}
