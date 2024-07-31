import { type ColumnDef } from '@tanstack/react-table';

import { type Bucket } from '@common/contracts';

import { cn } from '../../../../../@/lib/utils';
import { GrantUserAccessDialog } from '../../../user/components/grantUserAccessDialog/grantUserAccessDialog';
import { DeleteBucketDialog } from '../deleteBucketDialog/deleteBucketDialog';

import { Checkbox } from '@/components/ui/checkbox';

interface HeaderProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

function Header({ children, className }: HeaderProps): JSX.Element {
  return <div className={cn('w-full h-full flex items-center', className)}>{children}</div>;
}

export const bucketTableColumns: ColumnDef<Bucket>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Header>
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </Header>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: () => <Header>Bucket name</Header>,
    accessorKey: 'name',
    cell: ({ row }): JSX.Element => {
      return <p>{row.original.name}</p>;
    },
  },
  {
    header: () => <Header>Actions</Header>,
    accessorKey: 'actions',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="inline-flex gap-2">
          <GrantUserAccessDialog bucketName={row.original.name} />
          <DeleteBucketDialog bucketName={row.original.name} />
        </div>
      );
    },
  },
];
