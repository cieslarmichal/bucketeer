import { type LoggerService } from '../../../logger/services/loggerService/loggerService.js';
import { type HttpService } from '../../services/httpService/httpService.js';
import { HttpServiceImpl } from '../../services/httpService/httpServiceImpl.js';
import { HttpClientFactory } from '../httpClientFactory/httpClientFactory.js';

export class HttpServiceFactory {
  public constructor(private readonly loggerService: LoggerService) {}

  public create(): HttpService {
    const httpClient = HttpClientFactory.create();

    return new HttpServiceImpl(httpClient, this.loggerService);
  }
}
