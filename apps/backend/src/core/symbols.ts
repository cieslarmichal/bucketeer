export const symbols = {
  configProvider: Symbol('configProvider'),
  loggerService: Symbol('loggerService'),
  uuidService: Symbol('uuidService'),
  sqliteDatabaseClient: Symbol('sqliteDatabaseClient'),
  s3Client: Symbol('s3Client'),
  applicationHttpController: Symbol('applicationHttpController'),
};

export const coreSymbols = {
  configProvider: symbols.configProvider,
  loggerService: symbols.loggerService,
  uuidService: symbols.uuidService,
  s3Client: symbols.s3Client,
  sqliteDatabaseClient: symbols.sqliteDatabaseClient,
};
