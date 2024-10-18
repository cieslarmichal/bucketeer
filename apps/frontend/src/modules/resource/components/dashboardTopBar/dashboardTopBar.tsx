import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { LoadingSpinner } from "../../../../../@/components/ui/loadingSpinner";
import { CreateResourceModal } from "../createResourceModal/createResourceModal";
import { Button } from "../../../../../@/components/ui/button";
import { FC } from "react";
import { userAccessTokenSelector, useUserTokensStore } from "../../../core/stores/userTokens/userTokens";
import { userIdSelector, useUserStore } from "../../../core/stores/userStore/userStore";
import { useQuery } from "@tanstack/react-query";
import { findBucketsQueryOptions } from "../../../bucket/api/user/queries/findBuckets/findBucketsQueryOptions";
import { useNavigate } from "@tanstack/react-router";
import { useDownloadMany } from "../../hooks/useDownloadMany";
import { Bucket } from "@common/contracts";
import { Skeleton } from "../../../../../@/components/ui/skeleton";


interface DashboardTopBarProps {
    bucketName: string;
}

interface BucketSelectorProps {
    buckets: Array<Bucket>;
}

const BucketSelector: FC<BucketSelectorProps> = ({ buckets }) => {
    const navigate = useNavigate();

    return (
        <div className="relative inline-block w-52 sm:w-sm">
            <select
                className="truncate w-full  sm:w-sm"
                onInput={(e) => {
                navigate({
                    search: (prev) => ({ ...prev, bucketName: e.currentTarget.value }),
                });
                }}
            >
                {buckets.map((option) => (
                <option
                    className="max-w-52 truncate"
                    key={option.name}
                    value={option.name}
                >
                    {option.name}
                </option>
                ))}
            </select>
        </div>
    );
}

export const DashboardTopBar: FC<DashboardTopBarProps> = ({ bucketName }) => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const userId = useUserStore(userIdSelector);
    const { downloadMany, isDownloading } = useDownloadMany();

    const { data: bucketsData, isFetched: isBucketsFetched } = useQuery(findBucketsQueryOptions({
        accessToken,
        userId: userId as string,
    }));

    const onDownloadAll = async () => downloadMany({
        accessToken,
        bucketName: bucketName ?? '',
        ids: [],
      });
    
    return (
    <div className="flex flex-col max-w-[40rem] md:max-w-screen-xl md:min-w-[50rem] w-full sm:flex-row gap-4 sm:gap-8 items-center justify-between px-4">
        { isBucketsFetched && <BucketSelector buckets={bucketsData?.data ?? []} /> }
        { isBucketsFetched && <CreateResourceModal bucketName={bucketName ?? ''}></CreateResourceModal> }
        { isBucketsFetched && 
            <Button
                className='w-40'
                disabled={isDownloading}
                onClick={onDownloadAll}>
                    {isDownloading && <LoadingSpinner size={20} />}
                    {!isDownloading && 
                    <div className='flex gap-2 items-center justify-center'>
                        <ArrowDownTrayIcon className='w-8 h-8' />
                        <span>Download All</span>
                    </div>
                    }
            </Button>
        }
        { !isBucketsFetched && <Skeleton className="w-52 h-10"></Skeleton> }
        { !isBucketsFetched && <Skeleton className="w-40 h-10" /> }
        { !isBucketsFetched && <Skeleton className="w-40 h-10" /> }
    </div>
    )
}
