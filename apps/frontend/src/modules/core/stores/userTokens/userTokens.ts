import { create } from 'zustand';

import { type UserTokensState } from './userTokensState';

export const useUserTokensStore = create<UserTokensState>((set) => ({
  accessToken: '',
  refreshToken: '',
  removeTokens: (): void => set({ accessToken: '', refreshToken: '' }),
  setAccessToken: (accessToken): void => set({ accessToken }),
  setTokens: (tokens): void => set(tokens),
}));

export const userAccessTokenSelector = (state: UserTokensState) => state.accessToken;
export const userRefreshTokenSelector = (state: UserTokensState) => state.refreshToken;
