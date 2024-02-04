import { createLazyFileRoute } from '@tanstack/react-router';

import { columns } from '../../components/dataTable/columns/columns';
import { DataTable } from '../../components/dataTable/dataTable';

export const Route = createLazyFileRoute('/dashboard/')({
  component: Dashboard,
});

function Dashboard(): JSX.Element {
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
      <DataTable
        columns={columns}
        data={files}
      />
    </div>
  );
}
