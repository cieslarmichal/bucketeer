/* eslint-disable @typescript-eslint/no-explicit-any */

import { type FastifyInstance, type FastifyReply, type FastifyRequest, type FastifySchema } from 'fastify';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';

import { type HttpController } from '../common/types/http/httpController.js';
import { HttpHeader } from '../common/types/http/httpHeader.js';
import { type AttachedFile } from '../common/types/http/httpRequest.js';
import { type HttpRouteSchema, type HttpRoute } from '../common/types/http/httpRoute.js';

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

  public constructor(private readonly server: FastifyInstance) {}

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

      const handler = async (fastifyRequest: FastifyRequest, fastifyReply: FastifyReply): Promise<unknown> => {
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
          return fastifyReply.send(responseBody);
        } else {
          return fastifyReply.send();
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
        [statusCode]: {
          ...schema,
          description,
        },
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
