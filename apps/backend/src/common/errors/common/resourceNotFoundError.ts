import { BaseError } from '../base/baseError.js';

interface Context {
  readonly name: string;
  [key: string]: unknown;
}

export class ResourceNotFoundError extends BaseError<Context> {
  public constructor(context: Context) {
    super('ResourceNotFoundError', 'Resource not found.', context);
  }
}
