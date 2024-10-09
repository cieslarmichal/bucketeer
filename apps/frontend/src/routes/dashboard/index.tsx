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
import { Button } from '../../../@/components/ui/button';
import { useDownloadResourcesMutation } from '../../modules/resource/api/user/mutations/downloadResourcesMutation';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { useResourceDownload } from '../../modules/resource/hooks/useResourceDownload';
import { useBucketStore } from '../../modules/bucket/stores/bucketStore';

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

  const { download } = useResourceDownload();
  const navigate = useNavigate();

  const { mutateAsync: downloadAll, isPending: isDownloading } = useDownloadResourcesMutation({});

  const bucketsQuery = findBucketsQueryOptions({
    accessToken: accessToken as string,
    userId: userId as string,
  });
  
  const [pageSize] = useState(10);

  const { data: bucketsData, isFetched: isBucketsFetched } = useQuery(bucketsQuery);
  const { data: resourcesData, isFetched: isResourcesFetched } = useQuery({
    ...findBucketResourcesQueryOptions({
      accessToken: accessToken as string,
      bucketName: bucketName ?? '',
      page,
      pageSize,
    }),
  });

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

  const onDownloadAll = async () => {
    const ids = resourcesData?.data.map((r) => r.id);

    const response = await downloadAll({
      accessToken: accessToken as string,
      bucketName: bucketName ?? '',
      ids,
    })

    download({
      name: "resources.zip",
      src: response,
    })
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
        <Button 
          className='w-40'
          disabled={isDownloading}
          onClick={onDownloadAll}>
            {isDownloading && <LoadingSpinner size={20} />}
            {!isDownloading && 
              <div className='flex gap-2 items-center justify-center'>
                <ArrowDownTrayIcon className='w-8 h-8' />
                <span>Download All</span>
              </div>
            }
        </Button>
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
