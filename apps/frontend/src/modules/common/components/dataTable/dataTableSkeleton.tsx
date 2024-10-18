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
  } from '@tanstack/react-table';
  import { useMemo, useState } from 'react';
  
  import { Button } from '@/components/ui/button';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '../../../../../@/components/ui/skeleton';
  
  interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    pageIndex?: number;
    pageSize: number;
    pageCount?: number;
    onNextPage?: () => Promise<void> | void;
    onPreviousPage?: () => Promise<void> | void;
    filterLabel?: string;
    includeColumnsSelector?: boolean;
    skeletonSizes: Array<{ width: string, height: string }>
  }

  export function DataSkeletonTable<TData extends object, TValue>({
    columns,
    pageIndex,
    pageSize = 10,
    pageCount,
    skeletonSizes,
    onNextPage,
    onPreviousPage,
  }: DataTableProps<TData, TValue>): JSX.Element {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
    const state: Partial<TableState> = {
      sorting,
      columnFilters,
      columnVisibility,
    };
  
    if (pageIndex !== undefined && pageSize) {
      state.pagination = {
        pageIndex,
        pageSize,
      };
    }
  
    const data = useMemo(() => 
      Array.from({ length: pageSize }).map(() => 
        columns.reduce((acc, column) => {
          if ('accessorKey' in column) {
            acc[column.accessorKey as string] = "";
          }
          return acc;
        }, {} as Record<string, string>)
      ) as TData[],
    [columns, pageSize]);
  
    const rowCount = useMemo(() => (pageCount ?? 0) * pageSize, [pageCount, pageSize]);
  
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
    });
  
    return (
      <div className="w-full max-w-[40rem] md:max-w-screen-xl md:min-w-[50rem]">
        <div className="p-4 w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead className="p-4 m-0 h-14" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {data.map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className={`w-${skeletonSizes[cellIndex].width} h-${skeletonSizes[cellIndex].height}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
      </div>
    );
  }