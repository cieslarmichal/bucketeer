import { useQuery } from '@tanstack/react-query';
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
} from '../../../@/components/ui/alert-dialog';
import { Button } from '../../../@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../@/components/ui/dialog';
import { ScrollArea } from '../../../@/components/ui/scroll-area';
import { findBucketsQueryOptions } from '../../api/bucket/queries/findBuckets/findBucketsQueryOptions';
import { useRevokeUserBucketAccessMutation } from '../../api/user/admin/mutations/revokeUserBucketAccessMutation/revokeUserBucketAccessMutation';
import { useUserTokensStore } from '../../core/stores/userTokens/userTokens';

interface DialogProps {
  userId: string;
  userEmail: string;
}

interface DialogContentProps {
  userId: string;
  userEmail: string;
}

export const ManageUserAccessesDialogContent = ({ userId, userEmail }: DialogContentProps): JSX.Element => {
  const accessToken = useUserTokensStore((state) => state.accessToken);

  const {
    data: userBuckets,
    refetch,
    // isFetched: isUserBucketsFetched,
    // isLoading: isUserBucketsLoading,
  } = useQuery({
    ...findBucketsQueryOptions({
      accessToken: accessToken as string,
      userId,
    }),
  });

  const { mutateAsync: revokeUserAccess } = useRevokeUserBucketAccessMutation({});

  const onConfirm = async (bucketName: string): Promise<void> => {
    await revokeUserAccess({
      accessToken: accessToken as string,
      bucketName,
      id: userId,
    });

    refetch();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manage accesses for user: {userEmail}</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <ul className="flex flex-col gap-4">
          {userBuckets?.data?.map((bucket, index) => (
            <li
              className="flex w-full items-center justify-between"
              key={`bucket-${bucket}-${index}`}
            >
              <p>{bucket.name}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-red-800 hover:bg-red-700">Revoke</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {userEmail} access to: {bucket.name}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        className="bg-red-800 hover:bg-red-700"
                        onClick={() => onConfirm(bucket.name)}
                      >
                        Revoke
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
};

export const ManageUserAccessesDialog = ({ userId, userEmail }: DialogProps): JSX.Element => {
  const [open, onOpenChange] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger>
        <Button>Manage accesses</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <ManageUserAccessesDialogContent
          userEmail={userEmail}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
};
