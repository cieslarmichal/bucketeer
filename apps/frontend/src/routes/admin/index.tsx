import { createFileRoute } from '@tanstack/react-router';

import { requireAdmin } from '../../modules/core/auth/requireAdmin';
import { type AppRouterContext } from '../../modules/core/router/routerContext';
import { AdminTabSelector } from '../../modules/admin/components/AdminTabSelector';

export const Route = createFileRoute('/admin/')({
  component: Admin,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAdmin(appContext);
  },
});

function Admin(): JSX.Element {
  return (
    <div className='p-4'>
      <AdminTabSelector currentlySelected='none' />
    </div>
  );
}
