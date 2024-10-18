import { useDownloadResourcesMutation } from "../api/user/mutations/downloadResourcesMutation";
import { useResourceDownload } from "./useResourceDownload";


interface DownloadManyPayload {
    ids: Array<string>;
    accessToken: string;
    bucketName: string;
}

export const useDownloadMany = () => {
    const { mutateAsync: downloadManyAsync, isPending: isDownloading } = useDownloadResourcesMutation({});
    const { download } = useResourceDownload();

    const downloadMany = async ( payload: DownloadManyPayload) => {
        const { accessToken, bucketName, ids } = payload;

        download({
            name: "resources.zip",
            src: await downloadManyAsync({
                accessToken,
                bucketName,
                ids
            })
        })
    }

    return {
        downloadMany,
        isDownloading,
    }
}
