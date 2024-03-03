interface DownloadFilePayload {
  blob: Blob;
  fileName: string;
}

export class FileDownloadService {
  public static downloadFile(payload: DownloadFilePayload): void {
    const { blob, fileName } = payload;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.download = fileName ?? 'file';

    a.href = url;

    document.body.appendChild(a);

    a.click();

    a.remove();
  }

  public static getFileUrl(blob: Blob): string {
    return window.URL.createObjectURL(blob);
  }
}
