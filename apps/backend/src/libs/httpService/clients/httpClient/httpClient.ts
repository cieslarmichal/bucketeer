/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Response } from 'node-fetch';

export interface FetchPayload {
  readonly url: string;
  readonly init?: any;
}

export interface HttpClient {
  fetch(payload: FetchPayload): Promise<Response>;
}
