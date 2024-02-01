import fetch, { type Response } from 'node-fetch';

import { type HttpClient, type FetchPayload } from './httpClient.js';

export class HttpClientImpl implements HttpClient {
  public async fetch(payload: FetchPayload): Promise<Response> {
    const { url, init } = payload;

    return fetch(url, init);
  }
}
