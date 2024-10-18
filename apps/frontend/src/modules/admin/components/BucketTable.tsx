import { useQuery } from "@tanstack/react-query";
import { bucketTableColumns } from "../../bucket/components/bucketTableColumns/bucketTableColumns"
import { DataTable } from "../../common/components/dataTable/dataTable"
import { adminFindBucketsQueryOptions } from "../../bucket/api/admin/queries/adminFindBuckets/adminFindBucketsQueryOptions";
import { useMemo, useState } from "react";
import { userAccessTokenSelector, useUserTokensStore } from "../../core/stores/userTokens/userTokens";
import { DataSkeletonTable } from "../../common/components/dataTable/dataTableSkeleton";



export const BucketTable = () => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
  
    const { data: buckets, isFetching } = useQuery({
        ...adminFindBucketsQueryOptions({
          accessToken,
          page,
          pageSize,
        }),
      });
    
    const pageCount = useMemo(() => {
        return buckets?.metadata.totalPages;
    }, [buckets?.metadata.totalPages]);

    const skeletonSizes = [{
        width: '8',
        height: '8'
    }, {
        width: 'full',
        height: '10',
    }, {
        width: 'full',
        height: '10'
    }];
    
    return (
        <>
        { isFetching && 
            <DataSkeletonTable 
                columns={bucketTableColumns}
                skeletonSizes={skeletonSizes}
                pageIndex={page}
                pageCount={pageCount}
                pageSize={pageSize}
                onPreviousPage={() => setPage(page - 1)}
                onNextPage={() => setPage(page + 1)}
            />
        }
        { !isFetching &&
            <DataTable
                columns={bucketTableColumns}
                data={buckets?.data ?? []}
                pageIndex={page}
                pageCount={pageCount}
                pageSize={pageSize}
                filterLabel="Filter bucket name..."
                onPreviousPage={() => setPage(page - 1)}
                onNextPage={() => setPage(page + 1)}
            />
        }
        </>
    )
}
