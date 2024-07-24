import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../@/components/ui/alert-dialog';
import { Button } from '../../../@/components/ui/button';
import { adminFindBucketsQueryOptions } from '../../modules/bucket/api/admin/queries/adminFindBuckets/adminFindBucketsQueryOptions';
import { CreateBucketDialog } from '../../modules/bucket/components/createBucketDialog/createBucketDialog';
import { DeleteBucketDialog } from '../../modules/bucket/components/deleteBucketDialog/deleteBucketDialog';
import { requireAdmin } from '../../modules/core/auth/requireAdmin';
import { type AppRouterContext } from '../../modules/core/router/routerContext';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';
import { useDeleteUserMutation } from '../../modules/user/api/admin/mutations/deleteUserMutation/deleteUserMutation';
import { adminFindUsersQueryOptions } from '../../modules/user/api/admin/queries/findUsersQuery/findUsersQueryOptions';
import { CreateUserDialog } from '../../modules/user/components/createUserDialog/createUserDialog';
import { GrantUserAccessDialog } from '../../modules/user/components/grantUserAccessDialog/grantUserAccessDialog';
import { ManageUserAccessesDialog } from '../../modules/user/components/manageUserAccessesDialog/manageUserAccessesDialog';

export const Route = createFileRoute('/admin/')({
  component: Admin,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAdmin(appContext);
  },
});

function Admin(): JSX.Element {
  const accessToken = useUserTokensStore.getState().accessToken;

  const { data: buckets } = useQuery({
    ...adminFindBucketsQueryOptions(accessToken as string),
  });

  const { data: users, refetch: refetchUsers } = useQuery({
    ...adminFindUsersQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  const [createBucketDialogOpen, setCreateBucketDialogOpen] = useState(false);

  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);

  const [deleteUserAlertDialogOpen, setDeleteUserAlertDialogOpen] = useState(false);

  const { mutateAsync: deleteUserMutation } = useDeleteUserMutation({});

  const [deleteUser, setDeleteUser] = useState<
    | {
        email: string;
        id: string;
      }
    | undefined
  >(undefined);

  const onDeleteUser = async (userId: string): Promise<void> => {
    await deleteUserMutation({
      accessToken: accessToken as string,
      id: userId,
    });

    refetchUsers();
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-start-2">
        <div className="pb-4">
          <div>Buckets</div>
          <CreateBucketDialog
            dialogOpen={createBucketDialogOpen}
            onOpenChange={setCreateBucketDialogOpen}
          />
        </div>
        <div className="flex flex-col gap-2">
          {buckets?.data?.map((bucket, index) => (
            <div
              className="flex rounded-xl bg-zinc-700 p-2 text-white"
              key={`bucket-${bucket.name}-${index}`}
            >
              <div className="flex items-center justify-between w-full px-2 gap-4">
                <p>{bucket.name}</p>
                <GrantUserAccessDialog bucketName={bucket.name} />
                <DeleteBucketDialog bucketName={bucket.name} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-start-3">
        <div className="pb-4">
          <div>Users</div>
          <CreateUserDialog
            onOpenChange={setCreateUserDialogOpen}
            open={createUserDialogOpen}
          />
        </div>
        <div className="flex flex-col gap-2">
          {users?.data.map((user) => (
            <div
              key={`user-${user.id}`}
              className="flex items-center justify-between rounded-xl bg-zinc-700 p-2 text-white"
            >
              <p>{user.email}</p>
              <ManageUserAccessesDialog
                userEmail={user.email}
                userId={user.id}
              />
              <AlertDialog
                open={deleteUserAlertDialogOpen}
                onOpenChange={setDeleteUserAlertDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setDeleteUser({
                        email: user.email,
                        id: user.id,
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
