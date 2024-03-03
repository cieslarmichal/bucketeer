import { createContext } from 'react';
import { createStore } from 'zustand';

import { type UserState } from './userState';

export const userStore = createStore<UserState>((set) => ({
  removeUser: (): void =>
    set({
      user: {
        email: null,
        name: null,
        role: null,
      },
    }),
  setUser: (user): void => set({ user }),
  user: {
    email: null,
    name: null,
    role: null,
  },
}));

export const UserStoreContext = createContext<typeof userStore>(userStore);
