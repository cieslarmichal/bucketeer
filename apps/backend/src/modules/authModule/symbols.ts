export const symbols = {
  authModuleConfigProvider: Symbol('authModuleConfigProvider'),
  tokenService: Symbol('tokenService'),
  accessControlService: Symbol('accessControlService'),
};

export const authSymbols = {
  tokenService: symbols.tokenService,
  accessControlService: symbols.accessControlService,
};
