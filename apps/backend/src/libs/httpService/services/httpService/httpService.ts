/* eslint-disable @typescript-eslint/no-explicit-any */

import { type HttpMethodName } from '../../../../common/types/http/httpMethodName.js';
import { type HttpStatusCode } from '../../../../common/types/http/httpStatusCode.js';

export interface SendRequestPayload {
  readonly method: HttpMethodName;
  readonly url: string;
  readonly headers?: Record<string, string>;
  readonly queryParams?: Record<string, string>;
  readonly body?: any;
}

export interface HttpResponse<ReponseBody = unknown> {
  readonly statusCode: HttpStatusCode;
  readonly body: ReponseBody;
}

export interface HttpService {
  sendRequest<ResponseBody>(payload: SendRequestPayload): Promise<HttpResponse<ResponseBody>>;
}
