import { createContext } from 'react';
import { createStore } from 'zustand';

import { type UserTokensState } from './userTokensState';

export const userTokensStore = createStore<UserTokensState>((set) => ({
  accessToken: null,
  refreshToken: null,
  removeTokens: (): void => set({ accessToken: null, refreshToken: null }),
  setAccessToken: (accessToken): void => set({ accessToken }),
  setTokens: (tokens): void => set(tokens),
}));

export const UserTokensStoreContext = createContext(userTokensStore);
