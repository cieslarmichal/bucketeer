import { ArrowUpOnSquareIcon } from '@heroicons/react/20/solid';
import { type FC, useEffect, useRef, useState } from 'react';

import { Button } from '../../../../../@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { FileInput } from '../../../../../@/components/ui/input';
import { LoadingSpinner } from '../../../../../@/components/ui/loadingSpinner';
import { useFileUpload } from '../../composable/useFileUpload/useFileUpload';

interface CreateResourceModalProps {
  bucketName: string;
}

const MAX_FILE_SIZE = Number(import.meta.env['VITE_MAX_FILE_SIZE']);

const acceptedImageAndVideoFormats =
  'audio/,video/quicktime,video/x-msvideo,video/x-ms-wmv,.jpg,.jpeg,.tiff,.webp,.raw,.png,.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm,.mpeg,.mpg,.3gp,.ogg,.ts,.m4v,.m2ts,.vob,.rm,.rmvb,.divx,.asf,.swf,.f4v' as string;

const allowedFormats = acceptedImageAndVideoFormats.replaceAll('.', '/').split(',');

allowedFormats.push('audio/');

export const CreateResourceModal: FC<CreateResourceModalProps> = ({ bucketName }) => {
  const [files, setFiles] = useState<File[]>([]);

  const [fileName, setFileName] = useState('');

  const [open, setOpen] = useState(false);

  const { abortController, isUploading, upload } = useFileUpload({
    files,
    setFiles,
    bucketName,
    onUploaded: () => {
      setOpen(false);

      setFileName('');
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let dataTransfer: DataTransfer | undefined;

    if (files.length > 0) {
      dataTransfer = new DataTransfer();

      const fileNameStringsArray = [];

      for (const file of files) {
        dataTransfer.items.add(file);

        fileNameStringsArray.push(file.name);
      }

      setFileName(fileNameStringsArray.join(','));

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    }

    if (fileInputRef.current && files.length === 0) {
      fileInputRef.current.files = new DataTransfer().files;

      setFileName('');
    }

    return (): void => {
      if (dataTransfer) {
        dataTransfer.clearData();
      }
    };
  }, [files]);

  const onUpload = async (): Promise<void> => {
    if (!files) {
      setOpen(false);

      return;
    }

    await upload();
  };

  const isAllowedFormat = (type: string): boolean => {
    return allowedFormats.find((item) => type.includes(item)) ? true : false;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (value === false) {
          setFiles([]);

          setFileName('');

          abortController.current = new AbortController();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <ArrowUpOnSquareIcon className="h-8 w-8"></ArrowUpOnSquareIcon>
          <span>Upload resources</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl w-80 sm:w-[50rem] sm:h-[30rem]">
        <div className="h-full w-full flex flex-col gap-4">
          <DialogTitle>Add files to your bucket :)</DialogTitle>
          <FileInput
            className="sm:w-full w-full"
            containerClassName="sm:w-full w-full h-80"
            ref={fileInputRef}
            onChange={(event) => {
              const files = event.target?.files;

              if (!files) {
                return;
              }

              const validFiles = [];

              for (const file of files) {
                const isOneOfAllowedFormats = isAllowedFormat(file.type);

                if (isOneOfAllowedFormats && file.size <= MAX_FILE_SIZE) {
                  validFiles.push(file);
                }
              }

              setFiles(validFiles.length > 0 ? validFiles : []);
            }}
            onFilesValueChange={(files) => {
              const validFiles = [];

              for (const file of files) {
                const isOneOfAllowedFormats = isAllowedFormat(file.type);

                if (isOneOfAllowedFormats && file.size <= MAX_FILE_SIZE) {
                  validFiles.push(file);
                }
              }

              setFiles(validFiles.length > 0 ? validFiles : []);
            }}
            accept={'audio/*,video/quicktime,video/x-msvideo,video/x-ms-wmv' + ',' + acceptedImageAndVideoFormats}
            type="file"
            multiple={true}
            fileName={fileName}
          ></FileInput>
          <Button
            onClick={onUpload}
            disabled={(files?.length === 0 ?? false) || isUploading}
          >
            {isUploading && <LoadingSpinner />}
            {!isUploading && <>Upload</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
