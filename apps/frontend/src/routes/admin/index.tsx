import { createFileRoute } from '@tanstack/react-router';

import { requireAdmin } from '../../core/auth/requireAdmin';
import { type AppRouterContext } from '../../core/router/routerContext';

export const Route = createFileRoute('/admin/')({
  component: Admin,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAdmin(appContext);
  },
});

function Admin(): JSX.Element {
  return <div>Admin</div>;
}
