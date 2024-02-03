export const symbols = {
  userModuleConfigProvider: Symbol('userModuleConfigProvider'),
  userMapper: Symbol('userMapper'),
  userRepository: Symbol('userRepository'),
  blacklistTokenMapper: Symbol('blacklistTokenMapper'),
  blacklistTokenRepository: Symbol('blacklistTokenRepository'),

  createUserCommandHandler: Symbol('createUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  findUserBucketsQueryHandler: Symbol('findUserBucketsQueryHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  refreshUserTokensCommandHandler: Symbol('refreshUserTokensCommandHandler'),
  logoutUserCommandHandler: Symbol('logoutUserCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),

  userHttpController: Symbol('userHttpController'),
  adminUserHttpController: Symbol('adminUserHttpController'),

  hashService: Symbol('hashService'),
  passwordValidationService: Symbol('passwordValidationService'),
};

export const userSymbols = {
  userHttpController: symbols.userHttpController,
  adminUserHttpController: symbols.adminUserHttpController,
  hashService: symbols.hashService,
  findUserBucketQueryHandler: symbols.findUserBucketsQueryHandler,
};
