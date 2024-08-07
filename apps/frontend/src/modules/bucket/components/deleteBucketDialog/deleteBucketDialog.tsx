import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../../@/components/ui/alert-dialog';
import { Button } from '../../../../../@/components/ui/button';
import { useToast } from '../../../../../@/components/ui/use-toast';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useDeleteBucketMutation } from '../../api/admin/mutations/deleteBucketMutation/deleteBucketMutation';
import { adminFindBucketsQueryOptions } from '../../api/admin/queries/adminFindBuckets/adminFindBucketsQueryOptions';
import { BucketApiQueryKeys } from '../../api/bucketApiQueryKeys';

interface Props {
  bucketName: string;
}

export const DeleteBucketDialog = ({ bucketName }: Props): JSX.Element => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const accessToken = useUserTokensStore.getState().accessToken;

  const [open, onOpenChange] = useState(false);

  const [deleteBucketName, setDeleteBucketName] = useState('');

  const { mutateAsync: deleteBucketMutation } = useDeleteBucketMutation({});

  const { refetch: refetchBuckets } = useQuery({
    ...adminFindBucketsQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  const onDeleteBucket = async (bucketName: string): Promise<void> => {
    try {
      await deleteBucketMutation({
        accessToken: accessToken as string,
        bucketName,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Something went wrong',
          description: error.message,
          variant: 'destructive',
        });

        return;
      }
    }

    onOpenChange(false);

    refetchBuckets();

    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === BucketApiQueryKeys.adminFindBuckets,
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => {
            setDeleteBucketName(bucketName);
          }}
          className="bg-red-800 hover:bg-red-700"
        >
          Delete bucket
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete <b>{bucketName}</b> and all it`s contents.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className="bg-red-800 hover:bg-red-700"
              onClick={() => onDeleteBucket(deleteBucketName)}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
