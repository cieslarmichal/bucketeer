export const symbols = {
  configProvider: Symbol('configProvider'),
  loggerService: Symbol('loggerService'),
  uuidService: Symbol('uuidService'),
  sqliteDatabaseClient: Symbol('sqliteDatabaseClient'),
  applicationHttpController: Symbol('applicationHttpController'),
};

export const coreSymbols = {
  configProvider: symbols.configProvider,
  loggerService: symbols.loggerService,
  uuidService: symbols.uuidService,
  sqliteDatabaseClient: symbols.sqliteDatabaseClient,
};
