import { AdminResourceHttpController } from './api/httpControllers/adminResourceHttpController/adminResourceHttpController.js';
import { ResourceHttpController } from './api/httpControllers/resourceHttpController/resourceHttpController.js';
import { type DeleteResourceCommandHandler } from './application/commandHandlers/deleteResourceCommandHandler/deleteResourceCommandHandler.js';
import { DeleteResourceCommandHandlerImpl } from './application/commandHandlers/deleteResourceCommandHandler/deleteResourceCommandHandlerImpl.js';
import { type DownloadImageQueryHandler } from './application/queryHandlers/downloadImageQueryHandler/downloadImageQueryHandler.js';
import { DownloadImageQueryHandlerImpl } from './application/queryHandlers/downloadImageQueryHandler/downloadImageQueryHandlerImpl.js';
import { type DownloadResourceQueryHandler } from './application/queryHandlers/downloadResourceQueryHandler/downloadResourceQueryHandler.js';
import { DownloadResourceQueryHandlerImpl } from './application/queryHandlers/downloadResourceQueryHandler/downloadResourceQueryHandlerImpl.js';
import { type DownloadResourcesQueryHandler } from './application/queryHandlers/downloadResourcesQueryHandler/downloadResourcesQueryHandler.js';
import { DownloadResourcesQueryHandlerImpl } from './application/queryHandlers/downloadResourcesQueryHandler/downloadResourcesQueryHandlerImpl.js';
import { type FindBucketsQueryHandler } from './application/queryHandlers/findBucketsQueryHandler/findBucketsQueryHandler.js';
import { FindBucketsQueryHandlerImpl } from './application/queryHandlers/findBucketsQueryHandler/findBucketsQueryHandlerImpl.js';
import { type FindResourcesMetadataQueryHandler } from './application/queryHandlers/findResourcesMetadataQueryHandler/findResourcesMetadataQueryHandler.js';
import { FindResourcesMetadataQueryHandlerImpl } from './application/queryHandlers/findResourcesMetadataQueryHandler/findResourcesMetadataQueryHandlerImpl.js';
import { type ResourceBlobService } from './domain/services/resourceBlobService/resourceBlobService.js';
import { ResourceBlobServiceImpl } from './infrastructure/services/resourceBlobService/resourceBlobServiceImpl.js';
import { symbols } from './symbols.js';
import { coreSymbols } from '../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';
import { type LoggerService } from '../../libs/logger/services/loggerService/loggerService.js';
import { type S3Client } from '../../libs/s3/clients/s3Client/s3Client.js';
import { type AccessControlService } from '../authModule/application/services/accessControlService/accessControlService.js';
import { authSymbols } from '../authModule/symbols.js';
import { type FindUserBucketsQueryHandler } from '../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { userSymbols } from '../userModule/symbols.js';

export class ResourceModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bind<ResourceBlobService>(
      symbols.resourceBlobService,
      () => new ResourceBlobServiceImpl(container.get<S3Client>(coreSymbols.s3Client)),
    );

    container.bind<DeleteResourceCommandHandler>(
      symbols.deleteResourceCommandHandler,
      () =>
        new DeleteResourceCommandHandlerImpl(
          container.get<ResourceBlobService>(symbols.resourceBlobService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
        ),
    );

    container.bind<FindResourcesMetadataQueryHandler>(
      symbols.findResourcesMetadataQueryHandler,
      () =>
        new FindResourcesMetadataQueryHandlerImpl(
          container.get<ResourceBlobService>(symbols.resourceBlobService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
        ),
    );

    container.bind<DownloadResourceQueryHandler>(
      symbols.downloadResourceQueryHandler,
      () =>
        new DownloadResourceQueryHandlerImpl(
          container.get<ResourceBlobService>(symbols.resourceBlobService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
        ),
    );

    container.bind<DownloadResourcesQueryHandler>(
      symbols.downloadResourcesQueryHandler,
      () =>
        new DownloadResourcesQueryHandlerImpl(
          container.get<ResourceBlobService>(symbols.resourceBlobService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
        ),
    );

    container.bind<DownloadImageQueryHandler>(
      symbols.downloadImageQueryHandler,
      () =>
        new DownloadImageQueryHandlerImpl(
          container.get<ResourceBlobService>(symbols.resourceBlobService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
        ),
    );

    container.bind<FindBucketsQueryHandler>(
      symbols.findBucketsQueryHandler,
      () => new FindBucketsQueryHandlerImpl(container.get<S3Client>(coreSymbols.s3Client)),
    );

    container.bind<ResourceHttpController>(
      symbols.resourceHttpController,
      () =>
        new ResourceHttpController(
          container.get<DeleteResourceCommandHandler>(symbols.deleteResourceCommandHandler),
          container.get<FindResourcesMetadataQueryHandler>(symbols.findResourcesMetadataQueryHandler),
          container.get<DownloadResourceQueryHandler>(symbols.downloadResourceQueryHandler),
          container.get<DownloadResourcesQueryHandler>(symbols.downloadResourcesQueryHandler),
          container.get<DownloadImageQueryHandler>(symbols.downloadImageQueryHandler),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<AdminResourceHttpController>(
      symbols.adminResourceHttpController,
      () =>
        new AdminResourceHttpController(
          container.get<FindBucketsQueryHandler>(symbols.findBucketsQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
