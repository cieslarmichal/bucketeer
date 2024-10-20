import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  type VisibilityState,
  getFilteredRowModel,
  type TableState,
  type Row,
} from '@tanstack/react-table';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { RowsProvider, useRowsDispatch } from './rowsContext';
import { Input } from '../../../../../@/components/ui/input';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onNextPage?: () => Promise<void> | void;
  onPreviousPage?: () => Promise<void> | void;
  filterLabel?: string;
  includeColumnsSelector?: boolean;
  PaginationSlot?: ReactNode;
}

interface EnhancedTableRowProps {
  row: Row<unknown>;
}

function EnhancedTableRow({ row }: EnhancedTableRowProps): JSX.Element {
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  const dispatch = useRowsDispatch();

  useEffect(() => {
    let isTouched = false;

    const handleFocus = (): void => {
      if (!isTouched) {
        dispatch({
          focusedRow: row.index
        });
      }
    };
    const handleBlur = (): void => {
      if (!isTouched) {
        dispatch({
          focusedRow: null
        });
      }
    };

    const handleTouchStart = (): void => {
      isTouched = true;
      dispatch({
        focusedRow: row.index
      });
    };
    const handleTouchEnd = (): void => {
      setTimeout(() => {
        isTouched = false;
      }, 300);
    };

    const rowElement = rowRef.current;

    if (rowElement) {
      rowElement.addEventListener('focus', handleFocus);
      rowElement.addEventListener('blur', handleBlur);
      rowElement.addEventListener('touchstart', handleTouchStart);
      rowElement.addEventListener('touchend', handleTouchEnd);
      rowElement.addEventListener('click', handleFocus);
    }

    return (): void => {
      if (rowElement) {
        rowElement.removeEventListener('focus', handleFocus);
        rowElement.removeEventListener('blur', handleBlur);
        rowElement.removeEventListener('touchstart', handleTouchStart);
        rowElement.removeEventListener('touchend', handleTouchEnd);
        rowElement.removeEventListener('click', handleFocus);
      }
    };
  }, [dispatch]);

  return (
    <TableRow
      ref={rowRef}
      key={row.id}
      data-state={row.getIsSelected() && 'selected'}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          className="h-20"
          key={cell.id}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  onNextPage,
  onPreviousPage,
  filterLabel = 'Filter file names...',
  includeColumnsSelector = false,
  PaginationSlot,
}: DataTableProps<TData, TValue>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const state: Partial<TableState> = {
    sorting,
    columnFilters,
    columnVisibility,
  };

  if (pageIndex && pageSize) {
    state.pagination = {
      pageIndex,
      pageSize,
    };
  }

  const rowCount = useMemo(() => {
    return (pageCount ?? 0) * (pageSize ?? 0);
  }, [pageCount, pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    state: {
      ...state,
    },
    rowCount,
    getRowId: (originalRow, index) => {
      if ('id' in originalRow && typeof originalRow.id === 'string') {
        return originalRow.id;
      }

      return index.toString();
    },
  });

  return (
    <div className="w-full max-w-[40rem] md:max-w-screen-xl md:min-w-[50rem]">
      <div className="p-4 w-full">
        {includeColumnsSelector && (
          <div className="flex items-center pb-4">
            <Input
              placeholder={filterLabel}
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-auto"
                >
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-primary-foreground"
                align="end"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="p-4 m-0 h-14"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <RowsProvider>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                  <EnhancedTableRow
                    key={`${row.id}-wrapper`}
                    row={row}
                  />
                ))
              ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  >
                  No results.
                </TableCell>
              </TableRow>
            )}
            </RowsProvider>
          </TableBody>
        </Table>
      </div>
      {PaginationSlot ?? 
        <div className="flex items-center justify-end space-x-2 py-4 mr-4">
          <Button
            variant="outline"
            size="sm"
            className="py-4 px-2"
            onClick={async () => {
              if (onPreviousPage && pageIndex !== undefined) {
                await onPreviousPage();
              }

              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="py-4 px-2"
            onClick={async () => {
              if (onNextPage && pageIndex !== undefined) {
                await onNextPage();
              }

              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      }
    </div>
  );
}
