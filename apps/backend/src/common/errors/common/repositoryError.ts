import { InfrastructureError } from '../base/infrastructureError.js';

interface Context {
  readonly entity: string;
  readonly operation: string;
}

export class RepositoryError extends InfrastructureError<Context> {
  public constructor(context: Context) {
    super('RepositoryError', 'Repository error.', context);
  }
}
