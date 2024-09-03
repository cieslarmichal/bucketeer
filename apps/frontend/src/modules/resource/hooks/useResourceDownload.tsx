interface DownloadProps {
    src: string;
    name: string;
}

export const useResourceDownload = () => {
    const download = ({ src, name }: DownloadProps) => {
        const aElement = document.createElement('a');
        aElement.setAttribute('download', name ?? 'file');
        aElement.href = src;

        document.body.appendChild(aElement);
        aElement.click();
        document.body.removeChild(aElement);
    }

    return {
        download
    }
}
