export interface UserState {
  user: {
    id: string | null;
    email: string | null;
    role: 'user' | 'admin' | null;
  };
  setUser: (user: UserState['user']) => void;
  removeUser: () => void;
}
