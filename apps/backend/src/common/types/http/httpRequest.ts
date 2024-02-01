/* eslint-disable @typescript-eslint/no-explicit-any */

export interface HttpRequest<Body = any, QueryParams = any, PathParams = any> {
  readonly body: Body;
  readonly queryParams: QueryParams;
  readonly pathParams: PathParams;
  readonly headers: Record<string, string>;
}
