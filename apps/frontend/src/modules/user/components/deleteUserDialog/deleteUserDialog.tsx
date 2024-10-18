import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

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
import { userAccessTokenSelector, useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useDeleteUserMutation } from '../../api/admin/mutations/deleteUserMutation/deleteUserMutation';
import { UserApiQueryKeys } from '../../api/userApiQueryKeys';
import { LoadingSpinner } from '../../../../../@/components/ui/loadingSpinner';

interface DeleteUserDialogProps {
  userEmail: string;
  userId: string;
}

export const DeleteUserDialog = ({ userEmail, userId }: DeleteUserDialogProps): ReactNode => {
  const queryClient = useQueryClient();

  const [deleteUserAlertDialogOpen, setDeleteUserAlertDialogOpen] = useState(false);
  const accessToken = useUserTokensStore(userAccessTokenSelector);
  const [deleteUser, setDeleteUser] = useState<
    | {
        email: string;
        id: string;
      }
    | undefined
  >(undefined);

  const { mutateAsync: deleteUserMutation, isPending: isDeleting } = useDeleteUserMutation({});

  const onDeleteUser = async (userId: string): Promise<void> => {
    await deleteUserMutation({
      accessToken: accessToken as string,
      id: userId,
    });

    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === UserApiQueryKeys.findUsers,
    });

    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === UserApiQueryKeys.findUserById && query.queryKey[1] === userId,
    });

    setDeleteUserAlertDialogOpen(false);
  };

  return (
    <AlertDialog
      open={deleteUserAlertDialogOpen}
      onOpenChange={setDeleteUserAlertDialogOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => {
            setDeleteUser({
              email: userEmail,
              id: userId,
            });
          }}
          className="bg-red-800 hover:bg-red-700"
        >
          Delete user
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete user <b>{deleteUser?.email}</b>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant={'outline'}
            onClick={() => setDeleteUserAlertDialogOpen(false)}
            className='w-40'
          >
            Cancel
          </Button>
          <Button
            className='w-40 bg-red-800 hover:bg-red-700'
            onClick={() => onDeleteUser(deleteUser?.id as string)}
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
