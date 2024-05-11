import { redirect } from '@tanstack/react-router';

import { type AppRouterContext } from '../router/routerContext';

export function requireAuth(context: AppRouterContext): void {
  const { authenticated } = context;

  if (!authenticated) {
    throw redirect({
      to: '/login',
    });
  }
}
