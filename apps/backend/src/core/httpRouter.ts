/* eslint-disable @typescript-eslint/no-explicit-any */

import { TypeClone } from '@sinclair/typebox';
import { type FastifyInstance, type FastifyReply, type FastifyRequest, type FastifySchema } from 'fastify';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

import { coreSymbols } from './symbols.js';
import { ApplicationError } from '../common/errors/base/applicationError.js';
import { BaseError } from '../common/errors/base/baseError.js';
import { DomainError } from '../common/errors/base/domainError.js';
import { OperationNotValidError } from '../common/errors/common/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../common/errors/common/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../common/errors/common/resourceNotFoundError.js';
import { type HttpController } from '../common/types/http/httpController.js';
import { HttpHeader } from '../common/types/http/httpHeader.js';
import { type AttachedFile } from '../common/types/http/httpRequest.js';
import { type HttpRouteSchema, type HttpRoute } from '../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../common/types/http/httpStatusCode.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { ForbiddenAccessError } from '../modules/authModule/application/errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../modules/authModule/application/errors/unathorizedAccessError.js';

const streamPipeline = promisify(pipeline);

export interface RegisterControllersPayload {
  readonly controllers: HttpController[];
}

export interface RegisterRoutesPayload {
  readonly routes: HttpRoute[];
  readonly basePath: string;
}

export interface NormalizePathPayload {
  readonly path: string;
}

export class HttpRouter {
  private readonly rootPath = '/api';
  private readonly loggerService: LoggerService;

  public constructor(
    private readonly server: FastifyInstance,
    private readonly container: DependencyInjectionContainer,
  ) {
    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);
  }

  public registerControllers(payload: RegisterControllersPayload): void {
    const { controllers } = payload;

    controllers.forEach((controller) => {
      const { basePath } = controller;

      const routes = controller.getHttpRoutes();

      this.registerRoutes({
        routes,
        basePath,
      });
    });
  }

  private registerRoutes(payload: RegisterRoutesPayload): void {
    const { routes, basePath } = payload;

    routes.map((httpRoute) => {
      const { method, path: controllerPath, tags, description } = httpRoute;

      const path = this.normalizePath({ path: `/${this.rootPath}/${basePath}/${controllerPath}` });

      const handler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<void> => {
        try {
          this.loggerService.debug({
            message: 'Received an HTTP request.',
            endpoint: `${method} ${fastifyRequest.url}`,
          });

          let attachedFiles: AttachedFile[] | undefined;

          if (fastifyRequest.isMultipart()) {
            attachedFiles = [];

            const files = fastifyRequest.files();

            for await (const file of files) {
              const { filename, mimetype, file: data } = file;

              const filePath = `/tmp/${filename}`;

              const writer = createWriteStream(filePath);

              await streamPipeline(data, writer);

              attachedFiles.push({
                name: filename,
                type: mimetype,
                filePath,
              });
            }
          }

          const {
            statusCode,
            body: responseBody,
            headers,
          } = await httpRoute.handler({
            body: fastifyRequest.body,
            pathParams: fastifyRequest.params,
            queryParams: fastifyRequest.query,
            headers: fastifyRequest.headers as Record<string, string>,
            files: attachedFiles,
          });

          fastifyReply.status(statusCode);

          fastifyReply.header(HttpHeader.contentType, 'application/json');

          if (headers) {
            Object.entries(headers).forEach(([headerName, headerValue]) => {
              fastifyReply.header(headerName, headerValue);
            });
          }

          if (responseBody) {
            await fastifyReply.send(responseBody);
          } else {
            await fastifyReply.send();
          }

          this.loggerService.info({
            message: 'Sent an HTTP response.',
            endpoint: `${method} ${fastifyRequest.url}`,
            statusCode,
          });
        } catch (error) {
          this.loggerService.error({
            message: 'Caught an error in the HTTP router.',
            err: error,
            path: fastifyRequest.url,
            method,
            statusCode: fastifyReply.statusCode,
          });

          if (error instanceof BaseError) {
            const formattedError: Record<string, unknown> = {
              name: error.name,
              message: error.message,
              context: error.context,
            };

            if (error instanceof ResourceNotFoundError) {
              fastifyReply.status(HttpStatusCode.notFound).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof OperationNotValidError) {
              fastifyReply.status(HttpStatusCode.unprocessableEntity).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof ResourceAlreadyExistsError) {
              fastifyReply.status(HttpStatusCode.unprocessableEntity).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof UnauthorizedAccessError) {
              fastifyReply.status(HttpStatusCode.unauthorized).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof ForbiddenAccessError) {
              fastifyReply.status(HttpStatusCode.forbidden).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof ApplicationError) {
              fastifyReply.status(HttpStatusCode.badRequest).send({
                error: formattedError,
              });

              return;
            }

            if (error instanceof DomainError) {
              fastifyReply.status(HttpStatusCode.badRequest).send({
                error: formattedError,
              });

              return;
            }

            fastifyReply.status(HttpStatusCode.internalServerError).send({
              error: formattedError,
            });

            return;
          }

          fastifyReply.status(HttpStatusCode.internalServerError).send({
            error: {
              name: 'InternalServerError',
              message: 'Internal server error',
            },
          });

          return;
        }
      };

      this.server.route({
        method,
        url: path,
        handler,
        schema: {
          description,
          tags,
          ...this.mapToFastifySchema(httpRoute.schema),
        },
      });
    });
  }

  private mapToFastifySchema(routeSchema: HttpRouteSchema): FastifySchema {
    const { pathParams, queryParams, body } = routeSchema.request;

    const fastifySchema: FastifySchema = {};

    if (pathParams) {
      fastifySchema.params = pathParams;
    }

    if (queryParams) {
      fastifySchema.querystring = queryParams;
    }

    if (body) {
      fastifySchema.body = body;
    }

    fastifySchema.response = Object.entries(routeSchema.response).reduce((agg, [statusCode, statusCodeSchema]) => {
      const { schema, description } = statusCodeSchema;

      return {
        ...agg,
        [statusCode]: TypeClone.Type(schema, { description }),
      };
    }, {});

    return fastifySchema;
  }

  private normalizePath(payload: NormalizePathPayload): string {
    const { path } = payload;

    const urlWithoutDoubleSlashes = path.replace(/(\/+)/g, '/');

    const urlWithoutTrailingSlash = urlWithoutDoubleSlashes.replace(/(\/)$/g, '');

    return urlWithoutTrailingSlash;
  }
}
