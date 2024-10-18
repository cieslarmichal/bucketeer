import { createFileRoute } from '@tanstack/react-router';
import { type ReactNode } from 'react';

import { TableLayout } from '../../modules/layouts/TableLayout';
import { UserTopBar } from '../../modules/admin/components/UserTopBar';
import { UserTable } from '../../modules/admin/components/UserTable';

export const Route = createFileRoute('/admin/user')({
  component: User,
});

function User(): ReactNode {
  return (
    <TableLayout
      TopBar={<UserTopBar />}
      Table={<UserTable />}
    />
  );
}
