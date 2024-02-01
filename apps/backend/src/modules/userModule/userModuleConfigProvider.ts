export interface UserModuleConfigProvider {
  getHashSaltRounds(): number;
  getAccessTokenExpiresIn(): number;
  getRefreshTokenExpiresIn(): number;
}
