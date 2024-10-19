import { useQuery } from "@tanstack/react-query";
import { userAccessTokenSelector, useUserTokensStore } from "../../../core/stores/userTokens/userTokens";
import { findBucketResourcesQueryOptions } from "../../api/user/queries/findBucketResources/findBucketResourcesQueryOptions";
import { FC, useEffect, useState } from "react";
import { imageTableColumns } from "../imageTableColumns/imageTableColumns";
import { DataTable } from "../../../common/components/dataTable/dataTable";
import { DataSkeletonTable } from "../../../common/components/dataTable/dataSkeletonTable";
import { TablePagination } from "./tablePagination";


interface ResourcesTableProps {
    bucketName: string;
    page: number;
    onNextPage: () => void;
    onPreviousPage: () => void;
}

export const ResourcesTable: FC<ResourcesTableProps> = ({ bucketName, page, onNextPage, onPreviousPage }) => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isFirstFetch, setIsFirstFetch] = useState(true);

    const { data: resourcesData, isFetched: isResourcesFetched, isError } = useQuery({
        ...findBucketResourcesQueryOptions({
          accessToken,
          bucketName,
          page,
          pageSize,
        }),
    });

    useEffect(() => {
        if (isFirstFetch && isResourcesFetched && !isError) {
            setIsFirstFetch(false);
        }
      }, [isFirstFetch, isError, isResourcesFetched]);

    useEffect(() => {
        if (isResourcesFetched) {
            setTotalPages(resourcesData?.metadata.totalPages || 1)
        }
    }, 
    [isResourcesFetched, resourcesData]
    );

    const skeletonSizes = [{
        width: "8",
        height: "8",
    }, {
        width: "full",
        height: "10",
    }, {
        width: "40",
        height: "40",
    }, {
        width: "full",
        height: "10",
    }, {
        width: "full",
        height: "10",
    }, {
        width: "full",
        height: "10",
    }];

    return (
        <>
            {!isResourcesFetched && bucketName && 
                <DataSkeletonTable
                    columns={imageTableColumns}
                    pageIndex={page}
                    skeletonSizes={skeletonSizes}
                    pageSize={pageSize}
                    pageCount={totalPages}
                    onNextPage={onNextPage}
                    onPreviousPage={onPreviousPage}
                    PaginationSlot={
                        !isFirstFetch ? <TablePagination 
                            current={page}
                            last={totalPages}
                        /> : <></>
                    }
                />
            }
            {isResourcesFetched && (
                <DataTable
                    columns={imageTableColumns}
                    data={resourcesData?.data ?? []}
                    pageIndex={page}
                    pageSize={pageSize}
                    pageCount={totalPages}
                    onNextPage={onNextPage}
                    onPreviousPage={onPreviousPage}
                    PaginationSlot={
                        <TablePagination
                            current={page}
                            last={totalPages}
                        />
                    }
                />
            )}
        </>
    )
}
