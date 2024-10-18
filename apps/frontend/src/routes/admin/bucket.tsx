import { createFileRoute } from '@tanstack/react-router';
import { type ReactNode } from 'react';

import { TableLayout } from '../../modules/layouts/TableLayout';
import { BucketTopBar } from '../../modules/admin/components/BucketTopBar';
import { BucketTable } from '../../modules/admin/components/BucketTable';

export const Route = createFileRoute('/admin/bucket')({
  component: AdminBucket,
});

function AdminBucket(): ReactNode {
  return (
    <TableLayout 
      TopBar={
        <BucketTopBar />
      }
      Table={<BucketTable />}
    />
  );
}
