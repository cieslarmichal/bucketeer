/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Readable } from 'node:stream';

export interface AttachedFile {
  readonly name: string;
  readonly type: string;
  readonly data: Readable;
}

export interface HttpRequest<Body = any, QueryParams = any, PathParams = any> {
  readonly body: Body;
  readonly queryParams: QueryParams;
  readonly pathParams: PathParams;
  readonly headers: Record<string, string>;
  readonly file?: AttachedFile | undefined;
}
