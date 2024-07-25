import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { type ReactNode, useMemo, useState } from 'react';

import { adminFindBucketsQueryOptions } from '../../modules/bucket/api/admin/queries/adminFindBuckets/adminFindBucketsQueryOptions';
import { bucketTableColumns } from '../../modules/bucket/components/bucketTableColumns/bucketTableColumns';
import { CreateBucketDialog } from '../../modules/bucket/components/createBucketDialog/createBucketDialog';
import { DataTable } from '../../modules/common/components/dataTable/dataTable';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';

export const Route = createFileRoute('/admin/bucket')({
  component: AdminBucket,
});

function AdminBucket(): ReactNode {
  const accessToken = useUserTokensStore.getState().accessToken;

  const [page, setPage] = useState(0);

  const [pageSize] = useState(10);

  const { data: buckets, isFetching } = useQuery({
    ...adminFindBucketsQueryOptions({
      accessToken: accessToken as string,
      page,
      pageSize,
    }),
  });

  const [createBucketDialogOpen, setCreateBucketDialogOpen] = useState(false);

  const pageCount = useMemo(() => {
    return buckets?.metadata.totalPages;
  }, [buckets?.metadata.totalPages]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full justify-center items-center">
      <div>
        <div className="pb-4">
          <div>Buckets</div>
          <CreateBucketDialog
            dialogOpen={createBucketDialogOpen}
            onOpenChange={setCreateBucketDialogOpen}
          />
        </div>
        <div className="flex flex-col gap-2">
          <DataTable
            columns={bucketTableColumns}
            data={buckets?.data ?? []}
            pageIndex={page}
            pageCount={pageCount}
            pageSize={pageSize}
            filterLabel="Filter bucket name..."
            onPreviousPage={() => setPage(page - 1)}
            onNextPage={() => setPage(page + 1)}
          />
        </div>
      </div>
    </div>
  );
}
