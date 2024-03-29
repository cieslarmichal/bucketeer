export const symbols = {
  resourceBlobService: Symbol('resourceBlobService'),

  findResourcesMetadataQueryHandler: Symbol('findResourcesMetadataQueryHandler'),
  downloadResourceQueryHandler: Symbol('downloadResourceQueryHandler'),
  downloadResourcesQueryHandler: Symbol('downloadResourcesQueryHandler'),
  downloadImageQueryHandler: Symbol('downloadImageQueryHandler'),
  downloadVideoPreviewQueryHandler: Symbol('downloadVideoPreviewQueryHandler'),
  deleteResourceCommandHandler: Symbol('deleteResourceCommandHandler'),
  uploadResourceCommandHandler: Symbol('uploadResourceCommandHandler'),

  findBucketsQueryHandler: Symbol('findBucketsQueryHandler'),
  createBucketCommandHandler: Symbol('createBucketCommandHandler'),
  deleteBucketCommandHandler: Symbol('deleteBucketCommandHandler'),

  resourceHttpController: Symbol('resourceHttpController'),
  adminResourceHttpController: Symbol('adminResourceHttpController'),
};

export const resourceSymbols = {
  resourceHttpController: symbols.resourceHttpController,
  adminResourceHttpController: symbols.adminResourceHttpController,
};
