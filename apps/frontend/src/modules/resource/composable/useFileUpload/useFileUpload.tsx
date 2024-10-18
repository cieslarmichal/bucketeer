import { useQueryClient } from '@tanstack/react-query';
import { type MutableRefObject, useRef, useState } from 'react';

import { useToast } from '../../../../../@/components/ui/use-toast';
import { userAccessTokenSelector, useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
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
  uploadPercentage: number;
  uploadedFilesCount: number;
}

const MAX_CHUNK_SIZE = 100_000_000; // ~100MB

const PARSED_FILE_UPLOAD = Number(import.meta.env['VITE_MAX_FILE_UPLOAD_TIMEOUT']);

const FILE_UPLOAD_TIMEOUT = Number.isNaN(PARSED_FILE_UPLOAD) ? 18 * 1000 : PARSED_FILE_UPLOAD;

export const useFileUpload = ({
  files,
  bucketName,
  setFiles,
  onUploaded,
}: UseFileUploadPayload): UseFileUploadReturn => {
  const queryClient = useQueryClient();
  const accessToken = useUserTokensStore(userAccessTokenSelector);
  const abortController = useRef(new AbortController());
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

  const { toast } = useToast();

  const { mutateAsync, isPending: isUploading } = useCreateResourcesMutation({});

  const sendFiles = async (files: File[]) => {
    const timeout = setTimeout(() => {
      abortController.current.abort();
    }, FILE_UPLOAD_TIMEOUT);

    await mutateAsync({
      accessToken: accessToken,
      bucketName,
      files,
      signal: abortController.current.signal,
    });

    clearTimeout(timeout);
  }

  const calculatePercentage = (a: number, b: number) => Math.ceil((a / b) * 100);

  const resetState = () => {
    setFiles([]);
    setUploadPercentage(0);
    setUploadedFilesCount(0);
  }

  const upload = async (): Promise<void> => {
    let runningTotalSize = 0;
    let uploadsSize = 0;
    let uploadedFiles = 0;
    let filesToSend: File[] = [];
    const filesCount = files.length;
    const totalFilesSize = files.reduce(
      (agg, file) => agg + file.size,0)

    try {
      abortController.current.signal.addEventListener('abort', () => {
        resetState();
        runningTotalSize = 0;
      });

      for (let i = 0; i < filesCount; i += 1) {
        const fileSize = files[i].size;

        runningTotalSize += fileSize;

        if (fileSize > MAX_CHUNK_SIZE) {
          await sendFiles([files[i]]);

          uploadedFiles += 1;
          setUploadedFilesCount(uploadedFiles);

          uploadsSize += runningTotalSize;
          setUploadPercentage(calculatePercentage(uploadsSize, totalFilesSize));
          continue;
        }

        filesToSend.push(files[i] as unknown as File);

        if (runningTotalSize >= MAX_CHUNK_SIZE) {
          await sendFiles(filesToSend);

          uploadedFiles += filesToSend.length;
          setUploadedFilesCount(uploadedFiles);

          uploadsSize += runningTotalSize;
          filesToSend = [];
          runningTotalSize = 0;
          setUploadPercentage(calculatePercentage(uploadsSize, totalFilesSize));
          continue;
        }

        if (i === files.length - 1) {
          await sendFiles(filesToSend);

          uploadedFiles += filesToSend.length;
          setUploadedFilesCount(uploadedFiles);

          uploadsSize += runningTotalSize;
          filesToSend = [];
          setUploadPercentage(calculatePercentage(uploadsSize, totalFilesSize));
        }
      }
    } catch (error) {
      resetState();

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
    setTimeout(() => {
      resetState();
    }, 500)

    setFiles([]);
  };

  return {
    upload,
    abortController,
    isUploading,
    uploadPercentage,
    uploadedFilesCount
  };
};
