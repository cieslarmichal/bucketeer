import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

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
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useDeleteUserMutation } from '../../api/admin/mutations/deleteUserMutation/deleteUserMutation';
import { UserApiQueryKeys } from '../../api/userApiQueryKeys';

interface DeleteUserDialogProps {
  userEmail: string;
  userId: string;
}

export const DeleteUserDialog = ({ userEmail, userId }: DeleteUserDialogProps): ReactNode => {
  const queryClient = useQueryClient();

  const [deleteUserAlertDialogOpen, setDeleteUserAlertDialogOpen] = useState(false);

  const accessToken = useUserTokensStore.getState().accessToken;

  const [deleteUser, setDeleteUser] = useState<
    | {
        email: string;
        id: string;
      }
    | undefined
  >(undefined);

  const { mutateAsync: deleteUserMutation } = useDeleteUserMutation({});

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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className="bg-red-800 hover:bg-red-700"
              onClick={() => onDeleteUser(deleteUser?.id as string)}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
