import { ArrowUpOnSquareIcon } from '@heroicons/react/20/solid';
import { useQueryClient } from '@tanstack/react-query';
import { type FC, useEffect, useRef, useState } from 'react';

import { Button } from '../../../../../@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { FileInput } from '../../../../../@/components/ui/input';
import { LoadingSpinner } from '../../../../../@/components/ui/loadingSpinner';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useCreateResourcesMutation } from '../../api/user/mutations/createResourceMutation';

interface CreateResourceModalProps {
  bucketName: string;
}

const MAX_CHUNK_SIZE = 100_000_000; // ~100MB

const MAX_FILE_SIZE = Number(import.meta.env['VITE_MAX_FILE_SIZE']);

const FILE_UPLOAD_TIMEOUT = Number(import.meta.env['VITE_MAX_FILE_UPLOAD_TIMEOUT']);

const acceptedImageAndVideoFormats =
  'audio/,video/quicktime,video/x-msvideo,video/x-ms-wmv,.jpg,.jpeg,.tiff,.webp,.raw,.png,.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm,.mpeg,.mpg,.3gp,.ogg,.ts,.m4v,.m2ts,.vob,.rm,.rmvb,.divx,.asf,.swf,.f4v' as string;

const allowedFormats = acceptedImageAndVideoFormats.replaceAll('.', '/').split(',');

allowedFormats.push('audio/');

export const CreateResourceModal: FC<CreateResourceModalProps> = ({ bucketName }) => {
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<File[]>([]);

  const abortController = useRef(new AbortController());

  const [fileName, setFileName] = useState('');

  const [open, setOpen] = useState(false);

  const accessToken = useUserTokensStore((selector) => selector.accessToken);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isPending } = useCreateResourcesMutation({});

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

    let runningTotalSize = 0;

    const filesCount = files.length;

    let filesToSend: File[] = [];

    for (let i = 0; i < filesCount; i += 1) {
      const fileSize = files[i].size;

      runningTotalSize += fileSize;

      abortController.current.signal.addEventListener('abort', () => {
        setFiles([]);

        runningTotalSize = 0;
      });

      if (fileSize > MAX_CHUNK_SIZE) {
        const timeout = setTimeout(() => {
          abortController.current.abort();
        }, FILE_UPLOAD_TIMEOUT);

        await mutateAsync({
          accessToken: accessToken as string,
          bucketName,
          files: [files[i] as File],
          signal: abortController.current.signal,
        });

        clearTimeout(timeout);

        continue;
      }

      filesToSend.push(files[i] as unknown as File);

      if (runningTotalSize >= MAX_CHUNK_SIZE) {
        const timeout = setTimeout(() => {
          abortController.current.abort();
        }, FILE_UPLOAD_TIMEOUT);

        await mutateAsync({
          accessToken: accessToken as string,
          bucketName,
          files: filesToSend,
          signal: abortController.current.signal,
        });

        clearTimeout(timeout);

        filesToSend = [];

        runningTotalSize = 0;
      }

      if (i === files.length - 1) {
        const timeout = setTimeout(() => {
          abortController.current.abort();
        }, FILE_UPLOAD_TIMEOUT);

        await mutateAsync({
          accessToken: accessToken as string,
          bucketName,
          files,
          signal: abortController.current.signal,
        });

        clearTimeout(timeout);

        filesToSend = [];
      }
    }

    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findBucketResources' && query.queryKey[1] === bucketName,
    });

    setFiles([]);

    setFileName('');

    setOpen(false);
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
            disabled={(files?.length === 0 ?? false) || isPending}
          >
            {isPending && <LoadingSpinner />}
            {!isPending && <>Upload</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
