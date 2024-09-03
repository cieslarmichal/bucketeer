interface DownloadProps {
    src: string | Blob;
    name: string;
}

export const useResourceDownload = () => {
    const download = ({ src, name }: DownloadProps) => {
        const aElement = document.createElement('a');

        if (typeof src === 'string') {
            aElement.href = src;
        } else {
            const url = window.URL.createObjectURL(src);
            aElement.href = url;
        }
        aElement.setAttribute('download', name ?? 'file');

        document.body.appendChild(aElement);
        aElement.click();

        window.URL.revokeObjectURL(aElement.href);
        document.body.removeChild(aElement);
    }

    return {
        download
    }
}
