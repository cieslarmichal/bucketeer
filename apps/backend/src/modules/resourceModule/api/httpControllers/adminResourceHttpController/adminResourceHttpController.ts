import { UserRole } from '@common/contracts';

import { findBucketsResponseBodyDTOSchema, type FindBucketsResponseBodyDTO } from './schemas/findBucketsSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindBucketsQueryHandler } from '../../../application/queryHandlers/findBucketsQueryHandler/findBucketsQueryHandler.js';

export class AdminResourceHttpController implements HttpController {
  public readonly basePath = '/admin/api/buckets';

  public constructor(
    private readonly findBucketsQueryHandler: FindBucketsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findBuckets.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findBucketsResponseBodyDTOSchema,
              description: 'Buckets found.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Bucket'],
        description: 'Find buckets.',
      }),
    ];
  }

  private async findBuckets(
    request: HttpRequest<undefined, undefined, undefined>,
  ): Promise<HttpOkResponse<FindBucketsResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { buckets } = await this.findBucketsQueryHandler.execute();

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: buckets,
      },
    };
  }
}
