import { create } from 'zustand';

import { type UserState } from './userState';

export const useUserStore = create<UserState>((set) => ({
  removeUser: (): void =>
    set({
      user: {
        email: null,
        id: null,
        role: null,
      },
    }),
  setUser: (user): void => set({ user }),
  user: {
    email: null,
    id: null,
    role: null,
  },
}));

export const removeUserSelector = (state: UserState) => state.removeUser;
export const setUserSelector = (state: UserState) => state.setUser;
export const userSelector = (state: UserState) => state.user;
export const userIdSelector = (state: UserState) => state.user.id;
