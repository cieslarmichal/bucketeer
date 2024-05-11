import { AdminResourceHttpController } from './api/httpControllers/adminResourceHttpController/adminResourceHttpController.js';
import { ResourceHttpController } from './api/httpControllers/resourceHttpController/resourceHttpController.js';
import { type CreateBucketCommandHandler } from './application/commandHandlers/createBucketCommandHandler/createBucketCommandHandler.js';
import { CreateBucketCommandHandlerImpl } from './application/commandHandlers/createBucketCommandHandler/createBucketCommandHandlerImpl.js';
import { type DeleteBucketCommandHandler } from './application/commandHandlers/deleteBucketCommandHandler/deleteBucketCommandHandler.js';
import { DeleteBucketCommandHandlerImpl } from './application/commandHandlers/deleteBucketCommandHandler/deleteBucketCommandHandlerImpl.js';
import { type DeleteResourceCommandHandler } from './application/commandHandlers/deleteResourceCommandHandler/deleteResourceCommandHandler.js';
import { DeleteResourceCommandHandlerImpl } from './application/commandHandlers/deleteResourceCommandHandler/deleteResourceCommandHandlerImpl.js';
import { type UploadResourcesCommandHandler } from './application/commandHandlers/uploadResourcesCommandHandler/uploadResourcesCommandHandler.js';
import { UploadResourcesCommandHandlerImpl } from './application/commandHandlers/uploadResourcesCommandHandler/uploadResourcesCommandHandlerImpl.js';
import { type DownloadImageQueryHandler } from './application/queryHandlers/downloadImageQueryHandler/downloadImageQueryHandler.js';
import { DownloadImageQueryHandlerImpl } from './application/queryHandlers/downloadImageQueryHandler/downloadImageQueryHandlerImpl.js';
import { type DownloadResourceQueryHandler } from './application/queryHandlers/downloadResourceQueryHandler/downloadResourceQueryHandler.js';
import { DownloadResourceQueryHandlerImpl } from './application/queryHandlers/downloadResourceQueryHandler/downloadResourceQueryHandlerImpl.js';
import { type DownloadResourcesQueryHandler } from './application/queryHandlers/downloadResourcesQueryHandler/downloadResourcesQueryHandler.js';
import { DownloadResourcesQueryHandlerImpl } from './application/queryHandlers/downloadResourcesQueryHandler/downloadResourcesQueryHandlerImpl.js';
import { type DownloadVideoPreviewQueryHandler } from './application/queryHandlers/downloadVideoPreviewQueryHandler/downloadVideoPreviewQueryHandler.js';
import { DownloadVideoPreviewQueryHandlerImpl } from './application/queryHandlers/downloadVideoPreviewQueryHandler/downloadVideoPreviewQueryHandlerImpl.js';
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

    container.bind<UploadResourcesCommandHandler>(
      symbols.uploadResourcesCommandHandler,
      () =>
        new UploadResourcesCommandHandlerImpl(
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

    container.bind<DownloadVideoPreviewQueryHandler>(
      symbols.downloadVideoPreviewQueryHandler,
      () =>
        new DownloadVideoPreviewQueryHandlerImpl(
          container.get<ResourceBlobService>(symbols.resourceBlobService),
          container.get<LoggerService>(coreSymbols.loggerService),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
        ),
    );

    container.bind<FindBucketsQueryHandler>(
      symbols.findBucketsQueryHandler,
      () => new FindBucketsQueryHandlerImpl(container.get<S3Client>(coreSymbols.s3Client)),
    );

    container.bind<CreateBucketCommandHandler>(
      symbols.createBucketCommandHandler,
      () =>
        new CreateBucketCommandHandlerImpl(
          container.get<S3Client>(coreSymbols.s3Client),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<DeleteBucketCommandHandler>(
      symbols.deleteBucketCommandHandler,
      () =>
        new DeleteBucketCommandHandlerImpl(
          container.get<S3Client>(coreSymbols.s3Client),
          container.get<LoggerService>(coreSymbols.loggerService),
        ),
    );

    container.bind<ResourceHttpController>(
      symbols.resourceHttpController,
      () =>
        new ResourceHttpController(
          container.get<DeleteResourceCommandHandler>(symbols.deleteResourceCommandHandler),
          container.get<FindResourcesMetadataQueryHandler>(symbols.findResourcesMetadataQueryHandler),
          container.get<DownloadResourceQueryHandler>(symbols.downloadResourceQueryHandler),
          container.get<UploadResourcesCommandHandler>(symbols.uploadResourcesCommandHandler),
          container.get<DownloadResourcesQueryHandler>(symbols.downloadResourcesQueryHandler),
          container.get<DownloadImageQueryHandler>(symbols.downloadImageQueryHandler),
          container.get<DownloadVideoPreviewQueryHandler>(symbols.downloadVideoPreviewQueryHandler),
          container.get<FindUserBucketsQueryHandler>(userSymbols.findUserBucketsQueryHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );

    container.bind<AdminResourceHttpController>(
      symbols.adminResourceHttpController,
      () =>
        new AdminResourceHttpController(
          container.get<FindBucketsQueryHandler>(symbols.findBucketsQueryHandler),
          container.get<CreateBucketCommandHandler>(symbols.createBucketCommandHandler),
          container.get<DeleteBucketCommandHandler>(symbols.deleteBucketCommandHandler),
          container.get<AccessControlService>(authSymbols.accessControlService),
        ),
    );
  }
}
