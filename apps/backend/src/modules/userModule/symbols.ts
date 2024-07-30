export const symbols = {
  userMapper: Symbol('userMapper'),
  userBucketMapper: Symbol('userBucketMapper'),
  userRepository: Symbol('userRepository'),
  userBucketRepository: Symbol('userBucketRepository'),
  blacklistTokenMapper: Symbol('blacklistTokenMapper'),
  blacklistTokenRepository: Symbol('blacklistTokenRepository'),

  createUserCommandHandler: Symbol('createUserCommandHandler'),
  grantBucketAccessCommandHandler: Symbol('grantBucketAccessCommandHandler'),
  revokeBucketAccessCommandHandler: Symbol('revokeBucketAccessCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  findUsersQueryHandler: Symbol('findUsersQueryHandler'),
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
  userBucketRepository: symbols.userBucketRepository,
};
