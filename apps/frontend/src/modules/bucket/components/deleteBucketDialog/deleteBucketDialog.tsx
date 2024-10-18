import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../../../@/components/ui/alert-dialog';
import { Button } from '../../../../../@/components/ui/button';
import { useToast } from '../../../../../@/components/ui/use-toast';
import { userAccessTokenSelector, useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useDeleteBucketMutation } from '../../api/admin/mutations/deleteBucketMutation/deleteBucketMutation';
import { BucketApiQueryKeys } from '../../api/bucketApiQueryKeys';
import { LoadingSpinner } from '../../../../../@/components/ui/loadingSpinner';

interface Props {
  bucketName: string;
}

export const DeleteBucketDialog = ({ bucketName }: Props): JSX.Element => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteBucketMutation, isPending: isDeleting } = useDeleteBucketMutation({});

  const accessToken = useUserTokensStore(userAccessTokenSelector);
  const [open, onOpenChange] = useState(false);
  const [deleteBucketName, setDeleteBucketName] = useState('');

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
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className='w-40'
              >
              Cancel
            </Button>
            <Button
              type='button'
              className="bg-red-800 hover:bg-red-700 w-40"
              onClick={() => onDeleteBucket(deleteBucketName)}
              disabled={isDeleting}
            >
              {!isDeleting && 'Delete'}
              {isDeleting && <LoadingSpinner />}
            </Button>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
