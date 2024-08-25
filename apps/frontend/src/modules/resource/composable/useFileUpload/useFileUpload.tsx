import { useQueryClient } from '@tanstack/react-query';
import { type MutableRefObject, useRef } from 'react';

import { useToast } from '../../../../../@/components/ui/use-toast';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useCreateResourcesMutation } from '../../api/user/mutations/createResourceMutation';

interface UseFileUploadPayload {
  files: File[];
  setFiles: (files: File[]) => void;
  onUploaded: () => void;
  bucketName: string;
}

interface UseFileUploadReturn {
  upload: () => Promise<void>;
  abortController: MutableRefObject<AbortController>;
  isUploading: boolean;
}

const MAX_CHUNK_SIZE = 100_000_000; // ~100MB

const parsedFileUpload = Number(import.meta.env['VITE_MAX_FILE_UPLOAD_TIMEOUT']);

const FILE_UPLOAD_TIMEOUT = Number.isNaN(parsedFileUpload) ? 18 * 1000 : parsedFileUpload;

export const useFileUpload = ({
  files,
  bucketName,
  setFiles,
  onUploaded,
}: UseFileUploadPayload): UseFileUploadReturn => {
  const queryClient = useQueryClient();

  const accessToken = useUserTokensStore((selector) => selector.accessToken);

  const abortController = useRef(new AbortController());

  const { toast } = useToast();

  const { mutateAsync, isPending: isUploading } = useCreateResourcesMutation({});

  const upload = async (): Promise<void> => {
    let runningTotalSize = 0;

    const filesCount = files.length;

    let filesToSend: File[] = [];

    try {
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
    } catch (error) {
      setFiles([]);

      if (error instanceof Error) {
        toast({
          title: 'Something went wrong.',
          description: error.message,
          variant: 'destructive',
        });

        return;
      }

      toast({
        title: 'Unknown error. Please try again.',
        variant: 'destructive',
      });
    }

    onUploaded();

    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'findBucketResources' && query.queryKey[1] === bucketName,
    });

    setFiles([]);
  };

  return {
    upload,
    abortController,
    isUploading,
  };
};
