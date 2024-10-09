export const symbols = {
  resourceBlobService: Symbol('resourceBlobService'),

  findResourcesMetadataQueryHandler: Symbol('findResourcesMetadataQueryHandler'),
  downloadResourceQueryHandler: Symbol('downloadResourceQueryHandler'),
  downloadResourcesQueryHandler: Symbol('downloadResourcesQueryHandler'),
  downloadVideoPreviewQueryHandler: Symbol('downloadVideoPreviewQueryHandler'),
  deleteResourceCommandHandler: Symbol('deleteResourceCommandHandler'),
  uploadResourcesCommandHandler: Symbol('uploadResourcesCommandHandler'),

  findBucketsQueryHandler: Symbol('findBucketsQueryHandler'),
  createBucketCommandHandler: Symbol('createBucketCommandHandler'),
  deleteBucketCommandHandler: Symbol('deleteBucketCommandHandler'),
  updateResourceCommandHandler: Symbol('updateResourceCommandHandler'),

  resourceHttpController: Symbol('resourceHttpController'),
  adminResourceHttpController: Symbol('adminResourceHttpController'),
};

export const resourceSymbols = {
  resourceHttpController: symbols.resourceHttpController,
  adminResourceHttpController: symbols.adminResourceHttpController,
  resourceBlobService: symbols.resourceBlobService,
};
