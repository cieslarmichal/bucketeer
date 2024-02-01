import { BaseError } from './baseError.js';

export class DomainError<Context> extends BaseError<Context> {
  public constructor(name: string, message: string, context: Context) {
    super(name, message, context);
  }
}
