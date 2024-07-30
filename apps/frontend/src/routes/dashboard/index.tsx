import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { LoadingSpinner } from '../../../@/components/ui/loadingSpinner';
import { findBucketsQueryOptions } from '../../modules/bucket/api/user/queries/findBuckets/findBucketsQueryOptions';
import { DataTable } from '../../modules/common/components/dataTable/dataTable';
import { requireAuth } from '../../modules/core/auth/requireAuth';
import { type AppRouterContext } from '../../modules/core/router/routerContext';
import { useUserStore } from '../../modules/core/stores/userStore/userStore';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';
import { findBucketResourcesQueryOptions } from '../../modules/resource/api/user/queries/findBucketResources/findBucketResourcesQueryOptions';
import { CreateResourceModal } from '../../modules/resource/components/createResourceModal/createResourceModal';
import { imageTableColumns } from '../../modules/resource/components/imageTableColumns/imageTableColumns';

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

  const navigate = useNavigate();

  const userId = useUserStore((state) => state.user.id);

  const bucketsQuery = findBucketsQueryOptions({
    accessToken: accessToken as string,
    userId: userId as string,
  });

  const { data: bucketsData, isFetched: isBucketsFetched } = useQuery(bucketsQuery);

  const [pageSize] = useState(10);

  const { data: resourcesData, isFetched: isResourcesFetched } = useQuery({
    ...findBucketResourcesQueryOptions({
      accessToken: accessToken as string,
      bucketName: bucketName ?? '',
      page,
      pageSize,
    }),
  });

  useEffect(() => {
    if (!bucketName && isBucketsFetched && (bucketsData?.data?.length ?? 0) > 0) {
      navigate({
        search: (prev) => ({ ...prev, bucketName: bucketsData?.data[0].name ?? '' }),
      });
    }
    // eslint-disable-next-line
  }, [isBucketsFetched, bucketName, bucketsData?.data]);

  const pageCount = useMemo(() => {
    return resourcesData?.metadata.totalPages || 1;
  }, [resourcesData?.metadata.totalPages]);

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

  if (!isBucketsFetched) {
    return <div>Loading ...</div>;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
        <select
          className="truncate max-w-52 sm:max-w-sm"
          onInput={(e) => {
            navigate({
              search: (prev) => ({ ...prev, bucketName: e.currentTarget.value }),
            });
          }}
        >
          {bucketsData?.data?.map((option) => (
            <option
              key={option.name}
              value={option.name}
            >
              {option.name}
            </option>
          ))}
        </select>
        <CreateResourceModal bucketName={bucketName ?? ''}></CreateResourceModal>
      </div>
      {isBucketsFetched && !isResourcesFetched && bucketName && <LoadingSpinner></LoadingSpinner>}
      {isBucketsFetched && isResourcesFetched && (
        <DataTable
          columns={imageTableColumns}
          data={resourcesData?.data ?? []}
          pageIndex={page}
          pageSize={pageSize}
          pageCount={pageCount}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
        />
      )}
    </div>
  );
}
