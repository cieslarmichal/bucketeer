import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useContext } from 'react';

import { findBucketsQueryOptions } from '../../api/bucket/queries/findBuckets/findBucketsQueryOptions';
import { columns } from '../../components/dataTable/columns/columns';
import { DataTable } from '../../components/dataTable/dataTable';
import { requireAuth } from '../../core/auth/requireAuth';
import { type AppRouterContext } from '../../core/router/routerContext';
import { UserTokensStoreContext } from '../../core/stores/userTokens/userTokens';

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
  const tokens = useContext(UserTokensStoreContext);

  // const buckets = useSuspenseQuery(findBucketsQueryOptions(tokens.getState().accessToken as string));

  const bucketsQuery = findBucketsQueryOptions(tokens.getState().accessToken as string);

  const { data: bucketsData } = useQuery(bucketsQuery);

  const files = [
    {
      name: 'file1',
      image: 'sample_image2.jpeg',
      updatedAt: '2021-01-01',
      contentSize: 10055778,
    },
    {
      name: 'file2',
      image: 'sample_image2.jpeg',
      updatedAt: '2021-01-01',
      contentSize: 200512,
    },
    {
      name: 'file3',
      image: 'sample_image2.jpeg',
      updatedAt: '2021-01-01',
      contentSize: 3002456,
    },
    ...Array.from({ length: 12 }).map((_, index) => ({
      name: `file${index}`,
      image: 'sample_image2.jpeg',
      updatedAt: '2021-01-01',
      contentSize: 10055778,
    })),
  ];

  return (
    <div className="w-full flex justify-center p-4">
      <select>
        {bucketsData?.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
      <DataTable
        columns={columns}
        data={files}
      />
    </div>
  );
}
