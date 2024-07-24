import { type ColumnDef } from '@tanstack/react-table';

import { type UserRole } from '@common/contracts';

import { cn } from '../../../../../@/lib/utils';
import { DeleteUserDialog } from '../deleteUserDialog/deleteUserDialog';
import { ManageUserAccessesDialog } from '../manageUserAccessesDialog/manageUserAccessesDialog';

import { Checkbox } from '@/components/ui/checkbox';

interface HeaderProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

function Header({ children, className }: HeaderProps): JSX.Element {
  return <div className={cn('w-full h-full flex items-center', className)}>{children}</div>;
}

interface User {
  id: string;
  email: string;
  role: UserRole;
}

export const userTableColumns: ColumnDef<User>[] = [
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
    header: () => <Header>User email</Header>,
    accessorKey: 'email',
    cell: ({ row }): JSX.Element => {
      return <p>{row.original.email}</p>;
    },
  },
  {
    header: () => <Header>User role</Header>,
    accessorKey: 'role',
    cell: ({ row }): JSX.Element => {
      return <p>{row.original.role}</p>;
    },
  },
  {
    header: () => <Header>Actions</Header>,
    accessorKey: 'actions',
    cell: ({ row }): JSX.Element => {
      return (
        <div className="inline-flex gap-2">
          <ManageUserAccessesDialog
            userEmail={row.original.email}
            userId={row.original.id}
          />
          <DeleteUserDialog
            userEmail={row.original.email}
            userId={row.original.id}
          />
        </div>
      );
    },
  },
];
