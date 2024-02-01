import { stringify } from 'querystring';

import { type HttpResponse, type HttpService, type SendRequestPayload } from './httpService.js';
import { type LoggerService } from '../../../logger/services/loggerService/loggerService.js';
import { type HttpClient } from '../../clients/httpClient/httpClient.js';
import { HttpServiceError } from '../../errors/httpServiceError.js';

export class HttpServiceImpl implements HttpService {
  public constructor(
    private readonly httpClient: HttpClient,
    private readonly loggerService: LoggerService,
  ) {}

  public async sendRequest<ResponseBody>(payload: SendRequestPayload): Promise<HttpResponse<ResponseBody>> {
    const { method, url: initialUrl, headers, queryParams, body: requestBody } = payload;

    const body = JSON.stringify(requestBody);

    let url = initialUrl;

    if (queryParams && Object.keys(queryParams).length) {
      url += `?${stringify(queryParams)}`;
    }

    this.loggerService.debug({
      message: 'Sending http request...',
      url,
      method,
      headers,
    });

    try {
      const response = await this.httpClient.fetch({
        url,
        init: {
          method,
          headers: headers as never,
          body,
        },
      });

      const responseBodyText = await response.text();

      const responseBody = !responseBodyText.length ? {} : JSON.parse(responseBodyText);

      this.loggerService.debug({
        message: 'Http request sent.',
        response: {
          statusCode: response.status,
          body: response.status >= 200 && response.status < 300 ? 'hidden' : responseBody,
        },
      });

      return {
        body: responseBody as ResponseBody,
        statusCode: response.status,
      };
    } catch (error) {
      const { name, message } =
        error instanceof Error
          ? error
          : {
              name: '',
              message: JSON.stringify(error),
            };

      this.loggerService.error({
        message: 'Http request error.',
        error: {
          name,
          message,
        },
      });

      throw new HttpServiceError({
        name,
        message,
      });
    }
  }
}
