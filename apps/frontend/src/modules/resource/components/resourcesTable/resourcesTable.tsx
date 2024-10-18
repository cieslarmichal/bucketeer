import { useQuery } from "@tanstack/react-query";
import { userAccessTokenSelector, useUserTokensStore } from "../../../core/stores/userTokens/userTokens";
import { findBucketResourcesQueryOptions } from "../../api/user/queries/findBucketResources/findBucketResourcesQueryOptions";
import { FC, useMemo, useState } from "react";
import { imageTableColumns } from "../imageTableColumns/imageTableColumns";
import { DataTable } from "../../../common/components/dataTable/dataTable";
import { Loader } from "../../../core/components/loader";
import { DataSkeletonTable } from "../../../common/components/dataTable/dataTableSkeleton";


interface ResourcesTableProps {
    bucketName: string;
    page: number;
    onNextPage: () => void;
    onPreviousPage: () => void;
}

export const ResourcesTable: FC<ResourcesTableProps> = ({ bucketName, page, onNextPage, onPreviousPage }) => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const [pageSize] = useState(10);

    const { data: resourcesData, isFetched: isResourcesFetched } = useQuery({
        ...findBucketResourcesQueryOptions({
          accessToken,
          bucketName,
          page,
          pageSize,
        }),
      });

    const pageCount = useMemo(() => {
        return resourcesData?.metadata.totalPages || 1;
    }, [resourcesData?.metadata.totalPages]);
    
    return (
        <>
            {!isResourcesFetched && bucketName && 
                <DataSkeletonTable
                    columns={imageTableColumns}
                    pageIndex={page}
                    pageSize={pageSize}
                    pageCount={pageCount}
                    onNextPage={onNextPage}
                    onPreviousPage={onPreviousPage}
                />
            }
            {isResourcesFetched && (
                <DataTable
                    columns={imageTableColumns}
                    data={resourcesData?.data ?? []}
                    pageIndex={page}
                    pageSize={pageSize}
                    pageCount={pageCount}
                    onNextPage={onNextPage}
                    onPreviousPage={onPreviousPage}
                />
            )}
        </>
    )
}
