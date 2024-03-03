import { type QueryClient } from '@tanstack/react-query';

export interface AppRouterContext {
  queryClient: QueryClient;
  authenticated: boolean;
  role: 'admin' | 'user' | '';
}
