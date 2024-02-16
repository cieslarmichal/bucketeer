import { UserRole } from '@common/contracts';

import {
  type CreateBucketBodyDTO,
  type CreateBucketResponseBodyDTO,
  createBucketBodyDTOSchema,
  createBucketResponseBodyDTOSchema,
} from './schemas/createBucketSchema.js';
import {
  type DeleteBucketResponseBodyDTO,
  deleteBucketPathParamsDTOSchema,
  deleteBucketResponseBodyDTOSchema,
  type DeleteBucketPathParamsDTO,
} from './schemas/deleteBucketSchema.js';
import { findBucketsResponseBodyDTOSchema, type FindBucketsResponseBodyDTO } from './schemas/findBucketsSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpNoContentResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBucketCommandHandler } from '../../../application/commandHandlers/createBucketCommandHandler/createBucketCommandHandler.js';
import { type DeleteBucketCommandHandler } from '../../../application/commandHandlers/deleteBucketCommandHandler/deleteBucketCommandHandler.js';
import { type FindBucketsQueryHandler } from '../../../application/queryHandlers/findBucketsQueryHandler/findBucketsQueryHandler.js';

export class AdminResourceHttpController implements HttpController {
  public readonly basePath = '/admin/api/buckets';

  public constructor(
    private readonly findBucketsQueryHandler: FindBucketsQueryHandler,
    private readonly createBucketCommandHandler: CreateBucketCommandHandler,
    private readonly deleteBucketCommandHandler: DeleteBucketCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBucket.bind(this),
        schema: {
          request: {
            body: createBucketBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: createBucketResponseBodyDTOSchema,
              description: 'Bucket created.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Bucket'],
        description: 'Create bucket.',
      }),
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
      new HttpRoute({
        method: HttpMethodName.delete,
        handler: this.deleteBucket.bind(this),
        schema: {
          request: {
            queryParams: deleteBucketPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteBucketResponseBodyDTOSchema,
              description: 'Bucket deleted.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Bucket'],
        description: 'Delete bucket.',
      }),
    ];
  }

  private async createBucket(
    request: HttpRequest<CreateBucketBodyDTO, undefined, undefined>,
  ): Promise<HttpNoContentResponse<CreateBucketResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    await this.createBucketCommandHandler.execute({
      bucketName: request.body.bucketName,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
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

  private async deleteBucket(
    request: HttpRequest<undefined, undefined, DeleteBucketPathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteBucketResponseBodyDTO>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedRole: UserRole.admin,
    });

    const { bucketName } = request.pathParams;

    await this.deleteBucketCommandHandler.execute({ bucketName });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }
}
