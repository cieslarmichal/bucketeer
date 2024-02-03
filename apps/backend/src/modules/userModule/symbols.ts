export const symbols = {
  userModuleConfigProvider: Symbol('userModuleConfigProvider'),
  userMapper: Symbol('userMapper'),
  userBucketMapper: Symbol('userBucketMapper'),
  userRepository: Symbol('userRepository'),
  blacklistTokenMapper: Symbol('blacklistTokenMapper'),
  blacklistTokenRepository: Symbol('blacklistTokenRepository'),

  createUserCommandHandler: Symbol('createUserCommandHandler'),
  grantBucketAccessCommandHandler: Symbol('grantBucketAccessCommandHandler'),
  revokeBucketAccessCommandHandler: Symbol('revokeBucketAccessCommandHandler'),
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
  findUserBucketsQueryHandler: symbols.findUserBucketsQueryHandler,
};
