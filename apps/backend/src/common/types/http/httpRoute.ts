import { type TSchema } from '@sinclair/typebox';

import { type HttpMethodName } from './httpMethodName.js';
import { type HttpRouteHandler } from './httpRouteHandler.js';
import { type SecurityMode } from './securityMode.js';

export interface HttpRouteSchema {
  readonly request: {
    body?: TSchema;
    queryParams?: TSchema;
    pathParams?: TSchema;
  };
  readonly response: Record<number, { schema: TSchema; description: string }>;
}

export interface HttpRouteDraft {
  readonly method: HttpMethodName;
  readonly path?: string;
  readonly handler: HttpRouteHandler;
  readonly schema: HttpRouteSchema;
  readonly securityMode?: SecurityMode;
  readonly tags: string[];
  readonly description: string;
}

export class HttpRoute {
  public readonly method: HttpMethodName;
  public readonly path: string;
  public readonly handler: HttpRouteHandler;
  public readonly schema: HttpRouteSchema;
  public readonly securityMode?: SecurityMode;
  public readonly tags: string[];
  public readonly description: string;

  public constructor(draft: HttpRouteDraft) {
    const { method, path, handler, schema, securityMode, tags, description } = draft;

    this.method = method;

    this.path = path ?? '';

    this.handler = handler;

    this.schema = schema;

    this.tags = tags;

    this.description = description;

    if (securityMode) {
      this.securityMode = securityMode;
    }
  }
}
