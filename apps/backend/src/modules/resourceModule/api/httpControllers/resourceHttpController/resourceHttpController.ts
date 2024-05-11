import {
  deleteResourceResponseBodyDTOSchema,
  type DeleteResourceResponseBodyDTO,
  type DeleteResourcePathParamsDTO,
  deleteResourcePathParamsDTOSchema,
} from './schemas/deleteResourceSchema.js';
import {
  type DownloadResourcePathParamsDTO,
  downloadResourcePathParamsDTOSchema,
  downloadResourceResponseBodyDTOSchema,
} from './schemas/downloadResourceSchema.js';
import {
  type DownloadVideoPreviewPathParamsDTO,
  downloadVideoPreviewPathParamsDTOSchema,
  downloadVideoPreviewResponseBodyDTOSchema,
} from './schemas/downloadVideoPreviewSchema.js';
import {
  type ExportResourcesResponseBodyDTO,
  exportResourcesResponseBodyDTOSchema,
  exportResourcesBodyDTOSchema,
  type ExportResourcesBodyDTO,
  exportResourcesPathParamsDTOSchema,
  type ExportResourcesPathParamsDTO,
} from './schemas/exportResourcesSchema.js';
import {
  findResourcesQueryParamsDTOSchema,
  findResourcesResponseBodyDTOSchema,
  type FindResourcesQueryParamsDTO,
  type FindResourcesResponseBodyDTO,
  findResourcesPathParamsDTOSchema,
  type FindResourcesPathParamsDTO,
} from './schemas/findResourcesSchema.js';
import {
  findUserBucketsResponseBodyDTOSchema,
  type FindUserBucketsResponseBodyDTO,
} from './schemas/findUserBucketsSchema.js';
import { type ResourceMetadataDTO } from './schemas/resourceMetadataDTO.js';
import {
  type UploadResourcesResponseBodyDTO,
  type UploadResourcesPathParamsDTO,
  uploadResourcesResponseBodyDTOSchema,
  uploadResourcesPathParamsDTOSchema,
} from './schemas/uploadResourceSchema.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpHeader } from '../../../../../common/types/http/httpHeader.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpOkResponse,
  type HttpNoContentResponse,
  type HttpCreatedResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type DeleteResourceCommandHandler } from '../../../application/commandHandlers/deleteResourceCommandHandler/deleteResourceCommandHandler.js';
import { type UploadResourcesCommandHandler } from '../../../application/commandHandlers/uploadResourcesCommandHandler/uploadResourcesCommandHandler.js';
import { type DownloadResourceQueryHandler } from '../../../application/queryHandlers/downloadResourceQueryHandler/downloadResourceQueryHandler.js';
import { type DownloadResourcesQueryHandler } from '../../../application/queryHandlers/downloadResourcesQueryHandler/downloadResourcesQueryHandler.js';
import { type DownloadVideoPreviewQueryHandler } from '../../../application/queryHandlers/downloadVideoPreviewQueryHandler/downloadVideoPreviewQueryHandler.js';
import { type FindResourcesMetadataQueryHandler } from '../../../application/queryHandlers/findResourcesMetadataQueryHandler/findResourcesMetadataQueryHandler.js';
import { type ResourceMetadata } from '../../../domain/entities/resource/resourceMetadata.js';

export class ResourceHttpController implements HttpController {
  public readonly basePath = '/api/buckets';

  public constructor(
    private readonly deleteResourceCommandHandler: DeleteResourceCommandHandler,
    private readonly findResourcesMetadataQueryHandler: FindResourcesMetadataQueryHandler,
    private readonly downloadResourceQueryHandler: DownloadResourceQueryHandler,
    private readonly uploadResourceCommandHandler: UploadResourcesCommandHandler,
    private readonly downloadResourcesQueryHandler: DownloadResourcesQueryHandler,
    private readonly downloadVideoPreviewQueryHandler: DownloadVideoPreviewQueryHandler,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
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
              schema: findUserBucketsResponseBodyDTOSchema,
              description: 'Buckets found',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Bucket'],
        description: 'Find buckets',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':bucketName/resources',
        handler: this.findResources.bind(this),
        schema: {
          request: {
            queryParams: findResourcesQueryParamsDTOSchema,
            pathParams: findResourcesPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findResourcesResponseBodyDTOSchema,
              description: `Bucket's resources metadata found.`,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: `Find bucket's resources metadata.`,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':bucketName/resources',
        handler: this.uploadResources.bind(this),
        schema: {
          request: {
            pathParams: uploadResourcesPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: uploadResourcesResponseBodyDTOSchema,
              description: 'Resources uploaded',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: `Upload Resources.`,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':bucketName/resources/export',
        handler: this.exportResources.bind(this),
        schema: {
          request: {
            body: exportResourcesBodyDTOSchema,
            pathParams: exportResourcesPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: exportResourcesResponseBodyDTOSchema,
              description: `Bucket's resources exported.`,
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: `Export bucket's resources.`,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':bucketName/resources/:resourceId',
        handler: this.downloadResource.bind(this),
        schema: {
          request: {
            pathParams: downloadResourcePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: downloadResourceResponseBodyDTOSchema,
              description: 'Resource downloaded',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Download resource',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':bucketName/resources/videos/previews/:resourceId',
        handler: this.downloadVideoPreview.bind(this),
        schema: {
          request: {
            pathParams: downloadVideoPreviewPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: downloadVideoPreviewResponseBodyDTOSchema,
              description: 'Video preview downloaded',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Download video preview',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':bucketName/resources/:resourceId',
        handler: this.deleteResource.bind(this),
        schema: {
          request: {
            pathParams: deleteResourcePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteResourceResponseBodyDTOSchema,
              description: 'Resource deleted',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Delete resource',
      }),
    ];
  }

  private async findBuckets(
    request: HttpRequest<undefined, undefined, undefined>,
  ): Promise<HttpOkResponse<FindUserBucketsResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { buckets } = await this.findUserBucketsQueryHandler.execute({
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: buckets,
      },
    };
  }

  private async findResources(
    request: HttpRequest<undefined, FindResourcesQueryParamsDTO, FindResourcesPathParamsDTO>,
  ): Promise<HttpOkResponse<FindResourcesResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bucketName } = request.pathParams;

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { resourcesMetadata, totalPages } = await this.findResourcesMetadataQueryHandler.execute({
      userId,
      page,
      pageSize,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: resourcesMetadata.map((resourceMetadata) =>
          this.mapResourceMetadataToResourceMetadataDTO(resourceMetadata),
        ),
        metadata: {
          page,
          pageSize,
          totalPages,
        },
      },
    };
  }

  private async exportResources(
    request: HttpRequest<ExportResourcesBodyDTO, undefined, ExportResourcesPathParamsDTO>,
  ): Promise<HttpOkResponse<ExportResourcesResponseBodyDTO>> {
    const ids = request.body.ids || [];

    const { bucketName } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { resourcesData } = await this.downloadResourcesQueryHandler.execute({
      userId,
      ids,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: resourcesData,
      headers: {
        [HttpHeader.contentDisposition]: 'attachment; filename=resources.zip',
        [HttpHeader.contentType]: 'application/zip',
      },
    };
  }

  private async uploadResources(
    request: HttpRequest<undefined, undefined, UploadResourcesPathParamsDTO>,
  ): Promise<HttpCreatedResponse<UploadResourcesResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const files = request.files;

    if (!files || files.length === 0) {
      throw new OperationNotValidError({
        reason: 'Files are required.',
      });
    }

    const { bucketName } = request.pathParams;

    await this.uploadResourceCommandHandler.execute({
      userId,
      bucketName,
      files,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: null,
    };
  }

  private async downloadResource(
    request: HttpRequest<undefined, undefined, DownloadResourcePathParamsDTO>,
  ): Promise<HttpOkResponse<unknown>> {
    const { resourceId, bucketName } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { resource } = await this.downloadResourceQueryHandler.execute({
      userId,
      resourceId,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: resource.data,
      headers: {
        [HttpHeader.cacheControl]: 'max-age=2592000',
        [HttpHeader.contentDisposition]: `attachment; filename=${`attachment; filename*=UTF-8''${encodeURIComponent(resource.name)}`}`,
        [HttpHeader.contentType]: resource.contentType,
      },
    };
  }

  private async downloadVideoPreview(
    request: HttpRequest<undefined, undefined, DownloadVideoPreviewPathParamsDTO>,
  ): Promise<HttpOkResponse<unknown>> {
    const { resourceId, bucketName } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { preview } = await this.downloadVideoPreviewQueryHandler.execute({
      userId,
      resourceId,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: preview.data,
      headers: {
        [HttpHeader.cacheControl]: 'max-age=2592000',
        [HttpHeader.contentDisposition]: `attachment; filename*=UTF-8''${encodeURIComponent(preview.name)}`,
        [HttpHeader.contentType]: preview.contentType,
      },
    };
  }

  private async deleteResource(
    request: HttpRequest<undefined, undefined, DeleteResourcePathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteResourceResponseBodyDTO>> {
    const { resourceId, bucketName } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    await this.deleteResourceCommandHandler.execute({
      userId,
      resourceId,
      bucketName,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapResourceMetadataToResourceMetadataDTO(resource: ResourceMetadata): ResourceMetadataDTO {
    return {
      id: resource.id,
      name: resource.name,
      updatedAt: resource.updatedAt,
      contentSize: resource.contentSize,
    };
  }
}
