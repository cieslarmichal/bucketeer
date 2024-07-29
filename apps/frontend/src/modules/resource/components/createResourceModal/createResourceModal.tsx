import { ArrowUpOnSquareIcon } from '@heroicons/react/20/solid';
import { useQueryClient } from '@tanstack/react-query';
import { type FC, useEffect, useRef, useState } from 'react';

import { Button } from '../../../../../@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { FileInput } from '../../../../../@/components/ui/input';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useCreateResourcesMutation } from '../../api/user/mutations/createResourceMutation';

interface CreateResourceModalProps {
  bucketName: string;
}

const acceptedImageAndVideoFormats =
  '.jpg,.jpeg,.tiff,.webp,.raw,.png,.mp4,.mov,.avi,.mkv,.wmv,.flv,.webm,.mpeg,.mpg,.3gp,.ogg,.ts,.m4v,.m2ts,.vob,.rm,.rmvb,.divx,.asf,.swf,.f4v' as string;

const allowedFormats = acceptedImageAndVideoFormats.replaceAll('.', '/').split(',');

allowedFormats.push('audio/');

export const CreateResourceModal: FC<CreateResourceModalProps> = ({ bucketName }) => {
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<File[]>([]);

  const [fileName, setFileName] = useState('');

  const [open, setOpen] = useState(false);

  const accessToken = useUserTokensStore((selector) => selector.accessToken);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync } = useCreateResourcesMutation({});

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

    await mutateAsync({
      accessToken: accessToken as string,
      bucketName,
      files,
    });

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
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <ArrowUpOnSquareIcon></ArrowUpOnSquareIcon>
          <span>Upload a resource</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add a file to your bucket :)</DialogTitle>
        <FileInput
          className="sm:w-full w-full"
          containerClassName="sm:w-full w-full"
          ref={fileInputRef}
          onChange={(event) => {
            const files = event.target?.files;

            if (!files) {
              return;
            }

            const validFiles = [];

            for (const file of files) {
              const isOneOfAllowedFormats = isAllowedFormat(file.type);

              if (isOneOfAllowedFormats) {
                validFiles.push(file);
              }
            }

            setFiles(validFiles.length > 0 ? validFiles : []);
          }}
          accept={'audio/*' + acceptedImageAndVideoFormats}
          type="file"
          multiple={true}
          fileName={fileName}
        ></FileInput>
        <Button
          onClick={onUpload}
          disabled={files?.length === 0 ?? false}
        >
          Upload
        </Button>
      </DialogContent>
    </Dialog>
  );
};
