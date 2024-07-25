/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifyMultipart } from '@fastify/multipart';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { fastify, type FastifyInstance } from 'fastify';
import { type FastifySchemaValidationError } from 'fastify/types/schema.js';

import { type ApplicationHttpController } from './api/httpControllers/applicationHttpController/applicationHttpController.js';
import { type Config } from './config.js';
import { HttpRouter } from './httpRouter.js';
import { coreSymbols, symbols } from './symbols.js';
import { BaseError } from '../common/errors/base/baseError.js';
import { InputNotValidError } from '../common/errors/common/inputNotValidError.js';
import { OperationNotValidError } from '../common/errors/common/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../common/errors/common/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../common/errors/common/resourceNotFoundError.js';
import { type HttpController } from '../common/types/http/httpController.js';
import { HttpStatusCode } from '../common/types/http/httpStatusCode.js';
import { type DependencyInjectionContainer } from '../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type LoggerService } from '../libs/logger/services/loggerService/loggerService.js';
import { ForbiddenAccessError } from '../modules/authModule/application/errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../modules/authModule/application/errors/unathorizedAccessError.js';
import { type AdminResourceHttpController } from '../modules/resourceModule/api/httpControllers/adminResourceHttpController/adminResourceHttpController.js';
import { type ResourceHttpController } from '../modules/resourceModule/api/httpControllers/resourceHttpController/resourceHttpController.js';
import { resourceSymbols } from '../modules/resourceModule/symbols.js';
import { type AdminUserHttpController } from '../modules/userModule/api/httpControllers/adminUserHttpController/adminUserHttpController.js';
import { type UserHttpController } from '../modules/userModule/api/httpControllers/userHttpController/userHttpController.js';
import { userSymbols } from '../modules/userModule/symbols.js';

export class HttpServer {
  public readonly fastifyServer: FastifyInstance;
  private readonly httpRouter: HttpRouter;
  private readonly container: DependencyInjectionContainer;
  private readonly loggerService: LoggerService;
  private readonly config: Config;

  public constructor(container: DependencyInjectionContainer) {
    this.container = container;

    this.loggerService = this.container.get<LoggerService>(coreSymbols.loggerService);

    this.config = container.get<Config>(coreSymbols.config);

    this.fastifyServer = fastify({ bodyLimit: 10 * 1024 * 1024 }).withTypeProvider<TypeBoxTypeProvider>();

    this.httpRouter = new HttpRouter(this.fastifyServer);
  }

  private getControllers(): HttpController[] {
    return [
      this.container.get<UserHttpController>(userSymbols.userHttpController),
      this.container.get<AdminUserHttpController>(userSymbols.adminUserHttpController),
      this.container.get<ApplicationHttpController>(symbols.applicationHttpController),
      this.container.get<ResourceHttpController>(resourceSymbols.resourceHttpController),
      this.container.get<AdminResourceHttpController>(resourceSymbols.adminResourceHttpController),
    ];
  }

  public async start(): Promise<void> {
    const { host, port } = this.config.server;

    this.setupErrorHandler();

    await this.initSwagger();

    this.fastifyServer.register(fastifyMultipart, {
      limits: {
        fileSize: 1024 * 1024 * 1024 * 4,
      },
    });

    await this.fastifyServer.register(fastifyHelmet);

    await this.fastifyServer.register(fastifyCors, {
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
    });

    this.fastifyServer.addHook('onRequest', (request, _reply, done) => {
      this.loggerService.debug({
        message: 'HTTP request received.',
        endpoint: `${request.method} ${request.url}`,
      });

      done();
    });

    this.fastifyServer.addHook('onSend', (request, reply, _payload, done) => {
      this.loggerService.debug({
        message: 'HTTP response sent.',
        endpoint: `${request.method} ${request.url}`,
        statusCode: reply.statusCode,
      });

      done();
    });

    this.fastifyServer.setSerializerCompiler(() => {
      return (data): string => JSON.stringify(data);
    });

    this.addRequestPreprocessing();

    this.httpRouter.registerControllers({
      controllers: this.getControllers(),
    });

    await this.fastifyServer.listen({
      port,
      host,
    });

    this.loggerService.info({
      message: 'HTTP Server started.',
      port,
      host,
    });
  }

  private setupErrorHandler(): void {
    this.fastifyServer.setSchemaErrorFormatter((errors, dataVar) => {
      const { instancePath, message } = errors[0] as FastifySchemaValidationError;

      return new InputNotValidError({
        reason: `${dataVar}${instancePath} ${message}`,
        value: undefined,
      });
    });

    this.fastifyServer.setErrorHandler((error, request, reply) => {
      const errorContext = {
        ...(error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
              context: error instanceof BaseError ? error.context : undefined,
            }
          : { error }),
      };

      this.loggerService.error({
        message: 'Caught an error in the HTTP server.',
        endpoint: `${request.method} ${request.url}`,
        error: errorContext,
      });

      const responseError = {
        ...errorContext,
        stack: undefined,
        cause: undefined,
      };

      if (error instanceof InputNotValidError) {
        return reply.status(HttpStatusCode.badRequest).send(responseError);
      }

      if (error instanceof ResourceNotFoundError) {
        return reply.status(HttpStatusCode.notFound).send(responseError);
      }

      if (error instanceof OperationNotValidError) {
        return reply.status(HttpStatusCode.badRequest).send(responseError);
      }

      if (error instanceof ResourceAlreadyExistsError) {
        return reply.status(HttpStatusCode.conflict).send(responseError);
      }

      if (error instanceof UnauthorizedAccessError) {
        return reply.status(HttpStatusCode.unauthorized).send(responseError);
      }

      if (error instanceof ForbiddenAccessError) {
        return reply.status(HttpStatusCode.forbidden).send(responseError);
      }

      return reply.status(HttpStatusCode.internalServerError).send({
        name: 'InternalServerError',
        message: 'Internal server error',
      });
    });
  }

  private async initSwagger(): Promise<void> {
    await this.fastifyServer.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Backend API',
          version: '1.0.0',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    });

    await this.fastifyServer.register(fastifySwaggerUi, {
      routePrefix: '/api/docs',
      uiConfig: {
        defaultModelRendering: 'model',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
      staticCSP: true,
    });
  }

  private addRequestPreprocessing(): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.fastifyServer.addHook('preValidation', (request, _reply, next) => {
      const body = request.body as Record<string, unknown>;

      this.trimStringProperties(body);

      next();
    });
  }

  private trimStringProperties(obj: Record<string, any>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.trimStringProperties(obj[key]);
      }
    }
  }
}
