import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { findBucketsQueryOptions } from '../../modules/bucket/api/user/queries/findBuckets/findBucketsQueryOptions';
import { columns } from '../../modules/common/components/dataTable/columns/columns';
import { DataTable } from '../../modules/common/components/dataTable/dataTable';
import { requireAuth } from '../../modules/core/auth/requireAuth';
import { type AppRouterContext } from '../../modules/core/router/routerContext';
import { useUserStore } from '../../modules/core/stores/userStore/userStore';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';
import { findBucketResourcesQueryOptions } from '../../modules/resource/api/user/queries/findBucketResources/findBucketResourcesQueryOptions';

export const Route = createFileRoute('/dashboard/')({
  component: Dashboard,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAuth(appContext);
  },
  // loader: ({ context }) => {
  //   const appContext = context as AppRouterContext;

  //   appContext.queryClient.ensureQueryData(findBucketsQueryOptions(appContext.accessToken));
  // },
});

function Dashboard(): JSX.Element {
  const accessToken = useUserTokensStore((state) => state.accessToken);

  const userId = useUserStore((state) => state.user.id);

  const bucketsQuery = findBucketsQueryOptions({
    accessToken: accessToken as string,
    userId: userId as string,
  });

  const { data: bucketsData, isFetched: isBucketsFetched } = useQuery(bucketsQuery);

  const [bucketName, setBucketName] = useState('');

  if (bucketName === '' && isBucketsFetched && bucketsData?.data[0]?.name) {
    setBucketName(bucketsData?.data[0]?.name);
  }

  const [page, setPage] = useState(1);

  const [pageSize] = useState(10);

  const { data: resourcesData, isFetched: isResourcesFetched } = useQuery({
    ...findBucketResourcesQueryOptions({
      accessToken: accessToken as string,
      bucketName,
      page,
      pageSize,
    }),
  });

  const pageCount = useMemo(() => {
    return resourcesData?.metadata.totalPages || 1;
  }, [resourcesData?.metadata.totalPages]);

  // if (resourcesData?.metadata.totalPages) {
  //   setPageCount(resourcesData.metadata.totalPages);
  // }

  const onNextPage = (): void => {
    setPage(page + 1);
  };

  const onPreviousPage = (): void => {
    setPage(page - 1);
  };

  return (
    <div className="w-full flex flex-col justify-center p-4">
      <select
        onInput={(e) => {
          setBucketName(e.currentTarget.value);
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
      {isBucketsFetched && isResourcesFetched && (
        <DataTable
          columns={columns}
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
