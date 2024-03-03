export interface UserTokensState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (tokens: Pick<UserTokensState, 'accessToken' | 'refreshToken'>) => void;
  setAccessToken: (accessToken: string) => void;
  removeTokens: () => void;
}
