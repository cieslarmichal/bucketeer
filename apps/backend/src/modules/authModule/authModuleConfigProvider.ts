export interface AuthModuleConfigProvider {
  getJwtSecret(): string;
}
