export interface UserTokensState {
  accessToken: string;
  refreshToken: string;
  setTokens: (tokens: Pick<UserTokensState, 'accessToken' | 'refreshToken'>) => void;
  setAccessToken: (accessToken: string) => void;
  removeTokens: () => void;
}
