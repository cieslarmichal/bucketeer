import { ArrowUpOnSquareIcon } from '@heroicons/react/20/solid';
import { type FC, useEffect, useRef, useState } from 'react';

import { Button } from '../../../../../@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { FileInput } from '../../../../../@/components/ui/input';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useCreateResourcesMutation } from '../../api/user/mutations/createResourceMutation';

interface CreateResourceModalProps {
  bucketName: string;
}

export const CreateResourceModal: FC<CreateResourceModalProps> = ({ bucketName }) => {
  const [files, setFiles] = useState<FileList | null>(null);

  const [fileName, setFileName] = useState('');

  const [open, setOpen] = useState(false);

  const accessToken = useUserTokensStore((selector) => selector.accessToken);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync } = useCreateResourcesMutation({});

  useEffect(() => {
    let dataTransfer: DataTransfer | undefined;

    if (files) {
      dataTransfer = new DataTransfer();

      const fileNameStringsArray = [];

      for (const file of files) {
        dataTransfer.items.add(file);

        fileNameStringsArray.push(file.name);
      }

      setFileName(fileNameStringsArray.join(', '));

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
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

    setFiles(null);

    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
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
          ref={fileInputRef}
          onChange={(event) => {
            const files = event.target?.files;

            setFiles(files ? files : null);
          }}
          accept="image/*,video/*,audio/*"
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
