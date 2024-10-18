import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../common/components/dataTable/dataTable"
import { userTableColumns } from "../../user/components/userTableColumns/userTableColumns"
import { adminFindUsersQueryOptions } from "../../user/api/admin/queries/findUsersQuery/findUsersQueryOptions";
import { userAccessTokenSelector, useUserTokensStore } from "../../core/stores/userTokens/userTokens";
import { useState } from "react";
import { DataSkeletonTable } from "../../common/components/dataTable/dataTableSkeleton";

export const UserTable = () => {
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
  
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const { data: users, isFetching } = useQuery({
        ...adminFindUsersQueryOptions({
          accessToken: accessToken as string,
        }),
    });

    const skeletonSizes = [{
        width: '8',
        height: '8'
    }, {
        width: 'full',
        height: '10',
    }, {
        width: 'full',
        height: '10'
    }, {
        width: 'full',
        height: '10'
    }];

    return (
        <>
            {!isFetching && <DataTable
                columns={userTableColumns}
                data={users?.data ?? []}
                pageCount={1}
                pageIndex={page}
                pageSize={pageSize}
                onPreviousPage={() => setPage(page - 1)}
                onNextPage={() => setPage(page + 1)}
            />}
            {isFetching && <DataSkeletonTable 
                columns={userTableColumns}
                pageSize={pageSize}
                skeletonSizes={skeletonSizes}
            />}
        </>
    )
}
