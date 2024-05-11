import { create } from 'zustand';

import { type UserTokensState } from './userTokensState';

export const useUserTokensStore = create<UserTokensState>((set) => ({
  accessToken: null,
  refreshToken: null,
  removeTokens: (): void => set({ accessToken: null, refreshToken: null }),
  setAccessToken: (accessToken): void => set({ accessToken }),
  setTokens: (tokens): void => set(tokens),
}));
