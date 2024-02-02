import {
  deleteResourceResponseBodyDTOSchema,
  type DeleteResourceResponseBodyDTO,
  type DeleteResourcePathParamsDTO,
  deleteResourcePathParamsDTOSchema,
} from './schemas/deleteResourceSchema.js';
import {
  type DownloadImagePathParamsDTO,
  downloadImagePathParamsDTOSchema,
  downloadImageResponseBodyDTOSchema,
} from './schemas/downloadImageSchema.js';
import {
  type DownloadResourcePathParamsDTO,
  downloadResourcePathParamsDTOSchema,
  downloadResourceResponseBodyDTOSchema,
} from './schemas/downloadResourceSchema.js';
import {
  type ExportResourcesResponseBodyDTO,
  exportResourcesResponseBodyDTOSchema,
  exportResourcesBodyDTOSchema,
  type ExportResourcesBodyDTO,
} from './schemas/exportResourcesSchema.js';
import {
  findResourcesQueryParamsDTOSchema,
  findResourcesResponseBodyDTOSchema,
  type FindResourcesQueryParamsDTO,
  type FindResourcesResponseBodyDTO,
} from './schemas/findResourcesSchema.js';
import { type ResourceMetadataDTO } from './schemas/resourceMetadataDTO.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse, type HttpNoContentResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type DeleteResourceCommandHandler } from '../../../application/commandHandlers/deleteResourceCommandHandler/deleteResourceCommandHandler.js';
import { type DownloadImageQueryHandler } from '../../../application/queryHandlers/downloadImageQueryHandler/downloadImageQueryHandler.js';
import { type DownloadResourceQueryHandler } from '../../../application/queryHandlers/downloadResourceQueryHandler/downloadResourceQueryHandler.js';
import { type DownloadResourcesQueryHandler } from '../../../application/queryHandlers/downloadResourcesQueryHandler/downloadResourcesQueryHandler.js';
import { type FindResourcesMetadataQueryHandler } from '../../../application/queryHandlers/findResourcesMetadataQueryHandler/findResourcesMetadataQueryHandler.js';
import { type ResourceMetadata } from '../../../domain/entities/resource/resourceMetadata.js';

export class ResourceHttpController implements HttpController {
  public readonly basePath = '/api/resources';

  public constructor(
    private readonly deleteResourceCommandHandler: DeleteResourceCommandHandler,
    private readonly findResourcesMetadataQueryHandler: FindResourcesMetadataQueryHandler,
    private readonly downloadResourceQueryHandler: DownloadResourceQueryHandler,
    private readonly downloadResourcesQueryHandler: DownloadResourcesQueryHandler,
    private readonly downloadImageQueryHandler: DownloadImageQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findResources.bind(this),
        schema: {
          request: {
            queryParams: findResourcesQueryParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findResourcesResponseBodyDTOSchema,
              description: 'Resources metadata found.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Find resources metadata.',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'export',
        handler: this.exportResources.bind(this),
        schema: {
          request: {
            body: exportResourcesBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: exportResourcesResponseBodyDTOSchema,
              description: 'Resources exported.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Export Resources.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':name',
        handler: this.downloadResource.bind(this),
        schema: {
          request: {
            pathParams: downloadResourcePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: downloadResourceResponseBodyDTOSchema,
              description: 'Resource downloaded.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Download resource.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: 'images/:width/:height/:name',
        handler: this.downloadImage.bind(this),
        schema: {
          request: {
            pathParams: downloadImagePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: downloadImageResponseBodyDTOSchema,
              description: 'Image downloaded.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Download image.',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':name',
        handler: this.deleteResource.bind(this),
        schema: {
          request: {
            pathParams: deleteResourcePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteResourceResponseBodyDTOSchema,
              description: 'Resource deleted.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['Resource'],
        description: 'Delete resource.',
      }),
    ];
  }

  private async findResources(
    request: HttpRequest<undefined, FindResourcesQueryParamsDTO, undefined>,
  ): Promise<HttpOkResponse<FindResourcesResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const page = request.queryParams.page ?? 1;

    const pageSize = request.queryParams.pageSize ?? 10;

    const { resourcesMetadata, totalPages } = await this.findResourcesMetadataQueryHandler.execute({
      userId,
      page,
      pageSize,
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
    request: HttpRequest<ExportResourcesBodyDTO, undefined, undefined>,
  ): Promise<HttpOkResponse<ExportResourcesResponseBodyDTO>> {
    const names = request.body.names || [];

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { resourcesData } = await this.downloadResourcesQueryHandler.execute({
      userId,
      names,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: resourcesData,
      file: {
        name: 'photos.zip',
        contentType: 'application/zip',
      },
    };
  }

  private async downloadResource(
    request: HttpRequest<undefined, undefined, DownloadResourcePathParamsDTO>,
  ): Promise<HttpOkResponse<unknown>> {
    const { name } = request.pathParams;

    if (name === '') {
      throw new OperationNotValidError({
        reason: 'Resource name cannot be empty.',
      });
    }

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { resource } = await this.downloadResourceQueryHandler.execute({
      userId,
      resourceName: name,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: resource.data,
      file: {
        name: resource.name,
        contentType: resource.contentType,
      },
    };
  }

  private async downloadImage(
    request: HttpRequest<undefined, undefined, DownloadImagePathParamsDTO>,
  ): Promise<HttpOkResponse<unknown>> {
    const { name, width, height } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { resource } = await this.downloadImageQueryHandler.execute({
      userId,
      resourceName: name,
      width,
      height,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: resource.data,
      file: {
        name: resource.name,
        contentType: resource.contentType,
      },
    };
  }

  private async deleteResource(
    request: HttpRequest<undefined, undefined, DeleteResourcePathParamsDTO>,
  ): Promise<HttpNoContentResponse<DeleteResourceResponseBodyDTO>> {
    const { name } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    await this.deleteResourceCommandHandler.execute({
      userId,
      resourceName: name,
    });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapResourceMetadataToResourceMetadataDTO(resource: ResourceMetadata): ResourceMetadataDTO {
    return {
      name: resource.name,
      updatedAt: resource.updatedAt,
      contentSize: resource.contentSize,
    };
  }
}
