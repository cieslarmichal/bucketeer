import { redirect } from '@tanstack/react-router';

import { type AppRouterContext } from '../router/routerContext';

export function requireAdmin(context: AppRouterContext): void {
  const { role, authenticated } = context;

  if (!authenticated) {
    throw redirect({
      to: '/login',
    });
  }

  if (role !== 'admin') {
    throw redirect({
      to: '/',
    });
  }
}
