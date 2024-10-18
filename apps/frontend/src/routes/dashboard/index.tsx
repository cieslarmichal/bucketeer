import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { findBucketsQueryOptions } from '../../modules/bucket/api/user/queries/findBuckets/findBucketsQueryOptions';
import { requireAuth } from '../../modules/core/auth/requireAuth';
import { type AppRouterContext } from '../../modules/core/router/routerContext';
import { useUserStore } from '../../modules/core/stores/userStore/userStore';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';
import { useBucketStore } from '../../modules/bucket/stores/bucketStore';
import { DashboardTopBar } from '../../modules/resource/components/dashboardTopBar/dashboardTopBar';
import { TableLayout } from '../../modules/layouts/TableLayout';
import { ResourcesTable } from '../../modules/resource/components/resourcesTable/resourcesTable';

const searchSchema = z.object({
  page: z.number().default(0),
  bucketName: z.string().optional(),
});

export const Route = createFileRoute('/dashboard/')({
  component: Dashboard,
  validateSearch: searchSchema.parse,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAuth(appContext);
  },
});

function Dashboard(): JSX.Element {
  const accessToken = useUserTokensStore((state) => state.accessToken);
  const { bucketName, page } = Route.useSearch({});
  const userId = useUserStore((state) => state.user.id);
  const { setBucket } = useBucketStore();

  const navigate = useNavigate();

  const bucketsQuery = findBucketsQueryOptions({
    accessToken,
    userId: userId as string,
  });
  
  const { data: bucketsData, isFetched: isBucketsFetched } = useQuery(bucketsQuery);
  useEffect(() => {
    setBucket({
      name: bucketName as string
    })
  }, [bucketName, setBucket])

  useEffect(() => {
    if (!bucketName && isBucketsFetched && (bucketsData?.data?.length ?? 0) > 0) {
      navigate({
        search: (prev) => ({ ...prev, bucketName: bucketsData?.data[0].name ?? '' }),
      });
    }
    // eslint-disable-next-line
  }, [isBucketsFetched, bucketName, bucketsData?.data]);

  const onNextPage = (): void => {
    navigate({
      search: (prev) => ({ ...prev, page: page + 1 }),
    });
  };
  const onPreviousPage = (): void => {
    navigate({
      search: (prev) => ({ ...prev, page: page - 1 }),
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <TableLayout
        TopBar={<DashboardTopBar bucketName={bucketName ?? ''} />}
        Table={<ResourcesTable 
          bucketName={bucketName ?? ''}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          page={page} />}
      />
    </div>
  );
}
