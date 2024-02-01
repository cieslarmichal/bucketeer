import { type HttpClient } from '../../clients/httpClient/httpClient.js';
import { HttpClientImpl } from '../../clients/httpClient/httpClientImpl.js';

export class HttpClientFactory {
  public static create(): HttpClient {
    return new HttpClientImpl();
  }
}
