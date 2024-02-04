import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import prettyBytes from 'pretty-bytes';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Resource {
  name: string;
  image: string;
  updatedAt: string;
  contentSize: number;
}

export const columns: ColumnDef<Resource>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
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
    header: ({ column }): JSX.Element => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }): JSX.Element => {
      return <div>{row.original.name}</div>;
    },
  },
  {
    header: () => <div className="text-xl">Image</div>,
    accessorKey: 'image',
    cell: ({ row }): JSX.Element => {
      return (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-10 h-10"
        />
      );
    },
  },
  {
    header: () => <div className="text-xl">Last Modified</div>,
    accessorKey: 'updatedAt',
    cell: ({ row }): JSX.Element => {
      const lastModified = new Date(row.original.updatedAt);

      return (
        <div>
          {lastModified.toLocaleDateString()} {lastModified.toLocaleTimeString()}
        </div>
      );
    },
  },
  {
    header: () => <div className="text-xl">Size</div>,
    accessorKey: 'contentSize',
    cell: ({ row }): JSX.Element => {
      const prettySize = prettyBytes(row.original.contentSize);

      return <div>{prettySize}</div>;
    },
  },
  {
    header: () => <div className="text-xl">Actions</div>,
    accessorKey: 'actions',
    cell: (): JSX.Element => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText('Test me up')}>Download</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem>Change name</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
