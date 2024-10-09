import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import prettyBytes from 'pretty-bytes';

import { type Resource } from '@common/contracts';

import { cn } from '../../../../../@/lib/utils';
import { PopupGallery } from '../../../common/components/popupGallery/popupGallery';

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
import { useRowsContext } from '../../../common/components/dataTable/rowsContext';
import { useResourceDownload } from '../../hooks/useResourceDownload';
import { useState } from 'react';
import { DeleteResourceModal } from './components/deleteResourceModal/deleteResourceModal';

interface HeaderProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

function Header({ children, className }: HeaderProps): JSX.Element {
  return <div className={cn('w-full h-full flex items-center', className)}>{children}</div>;
}

export const imageTableColumns: ColumnDef<Resource>[] = [
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
    header: ({ column }): JSX.Element => {
      return (
        <Header>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </Header>
      );
    },
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }): JSX.Element => {
      return <div>{row.original.name}</div>;
    },
  },
  {
    header: () => <Header>Preview</Header>,
    accessorKey: 'url',
    cell: ({ row, table }): JSX.Element => {
      const rowModel = table.getRowModel();
      const rowContext = useRowsContext();

      return (
        <div className="w-full flex items-center justify-center">
          <PopupGallery
            previewResourceIndex={row.index}
            resources={rowModel.rows.map((row) => row.original)}
            isFocused={rowContext.focusedRow === row.index}
          />
        </div>
      );
    },
  },
  {
    header: () => <Header>Last Modified</Header>,
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
    header: () => <Header>Size</Header>,
    accessorKey: 'contentSize',
    cell: ({ row }): JSX.Element => {
      const prettySize = prettyBytes(row.original.contentSize);

      return <div>{prettySize}</div>;
    },
  },
  {
    header: () => <Header>Actions</Header>,
    accessorKey: 'actions',
    cell: ({ row }): JSX.Element => {
      const { download } = useResourceDownload();
      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

      const handleDeleteConfirm = () => {
        // Perform delete operation
        console.log('Resource deleted');
        setIsDeleteModalOpen(false);
      };

      const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
      };

      return (
        <>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-2"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-primary-foreground"
            >
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => download({
                src: row.original.url,
                name: row.original.name
              })}>Download</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleDeleteClick}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem>Change name</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteResourceModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            resourceId={row.original.id}
          />
        </>
      );
    },
  },
];
