import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CommandLoading } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../../../@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../@/components/ui/form';
import { Input } from '../../../@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../../@/components/ui/popover';
import { cn } from '../../../@/lib/utils';
import { useCreateBucketMutation } from '../../api/bucket/mutations/admin/createBucketMutation/createBucketMutation';
import { useDeleteBucketMutation } from '../../api/bucket/mutations/admin/deleteBucketMutation/deleteBucketMutation';
import { adminFindBucketsQueryOptions } from '../../api/bucket/queries/admin/adminFindBuckets/adminFindBucketsQueryOptions';
import { useCreateUserMutation } from '../../api/user/admin/mutations/createUserMutation/createUserMutation';
import { useGrantBucketAccessMutation } from '../../api/user/admin/mutations/grantUserBucketAccessMutation/grantUserBucketAccessMutation';
import { adminFindUsersQueryOptions } from '../../api/user/admin/queries/findUsersQuery/findUsersQueryOptions';
import { requireAdmin } from '../../core/auth/requireAdmin';
import { type AppRouterContext } from '../../core/router/routerContext';
import { useUserTokensStore } from '../../core/stores/userTokens/userTokens';

export const Route = createFileRoute('/admin/')({
  component: Admin,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAdmin(appContext);
  },
});

const bucketSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(new RegExp(/^(?!.*\.\.)([a-z0-9])(?:[a-z0-9.-]*[a-z0-9])?$/, 'g'));

const createBucketSchema = z.object({
  bucketName: bucketSchema,
});

const grantBucketAccessSchema = z.object({
  userId: z.string().uuid(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/gi,
      'Password should have at least one uppercase letter, a number & minimum 8 characters',
    ),
});

function Admin(): JSX.Element {
  const accessToken = useUserTokensStore.getState().accessToken;

  const { data: buckets, refetch: refetchBuckets } = useQuery({
    ...adminFindBucketsQueryOptions(accessToken as string),
  });

  const {
    data: users,
    isFetched: isUsersFetched,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useQuery({
    ...adminFindUsersQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  const [createBucketDialogOpen, setCreateBucketDialogOpen] = useState(false);

  const [grantAccessDialogOpen, setGrantAccessDialogOpen] = useState(false);

  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);

  const [deleteBucketAlertDialogOpen, setDeleteBucketAlertDialogOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [__, setSearchedUser] = useState('');

  const { mutateAsync: createBucket } = useCreateBucketMutation({});

  const { mutateAsync: grantBucketAccess } = useGrantBucketAccessMutation({});

  const { mutateAsync: createUser } = useCreateUserMutation({});

  const { mutateAsync: deleteBucket } = useDeleteBucketMutation({});

  const createBucketForm = useForm({
    resolver: zodResolver(createBucketSchema),
    values: {
      bucketName: '',
    },
    mode: 'onChange',
  });

  const grantBucketAccessForm = useForm({
    resolver: zodResolver(grantBucketAccessSchema),
    values: {
      userId: '',
    },
    mode: 'onChange',
  });

  const createUserForm = useForm({
    resolver: zodResolver(createUserSchema),
    values: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onCreateBucket = async (payload: z.infer<typeof createBucketSchema>): Promise<void> => {
    await createBucket({
      accessToken: accessToken as string,
      bucketName: payload.bucketName.toLowerCase(),
    });

    setCreateBucketDialogOpen(false);

    createBucketForm.reset();

    await refetchBuckets();
  };

  const onGrantAccess = async (
    payload: z.infer<typeof grantBucketAccessSchema> & { bucketName: string },
  ): Promise<void> => {
    if (!payload.bucketName) {
      return;
    }

    await grantBucketAccess({
      accessToken: accessToken as string,
      bucketName: payload.bucketName,
      id: payload.userId,
    });

    setGrantAccessDialogOpen(false);

    grantBucketAccessForm.reset();
  };

  const onCreateUser = async (payload: z.infer<typeof createUserSchema>): Promise<void> => {
    await createUser({
      ...payload,
      accessToken: accessToken as string,
    });

    setCreateUserDialogOpen(false);

    createUserForm.reset();

    refetchUsers();
  };

  const onDeleteBucket = async (bucketName: string): Promise<void> => {
    await deleteBucket({
      accessToken: accessToken as string,
      bucketName,
    });

    setDeleteBucketAlertDialogOpen(false);

    refetchBuckets();
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-start-2">
        <div className="pb-4">
          <div>Buckets</div>
          <Dialog
            open={createBucketDialogOpen}
            onOpenChange={setCreateBucketDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setCreateBucketDialogOpen(!createBucketDialogOpen)}>Create a bucket</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle> Create a bucket </DialogTitle>
              </DialogHeader>
              <div>
                <Form {...createBucketForm}>
                  <form
                    className="grid gap-4"
                    onSubmit={createBucketForm.handleSubmit(onCreateBucket)}
                  >
                    <FormField
                      control={createBucketForm.control}
                      name="bucketName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bucket name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bucket name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage></FormMessage>
                        </FormItem>
                      )}
                    />
                    <Button
                      disabled={!createBucketForm.formState.isValid}
                      type="submit"
                    >
                      Create
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-2">
          {buckets?.data?.map((bucket, index) => (
            <div
              className="flex rounded-xl bg-zinc-700 p-2 text-white"
              key={`bucket-${bucket.name}-${index}`}
            >
              <div className="flex items-center justify-between w-full px-2 gap-4">
                <p>{bucket.name}</p>
                <Dialog
                  open={grantAccessDialogOpen}
                  onOpenChange={setGrantAccessDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>Grant access</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        Assign access to bucket <b>{bucket.name}</b>{' '}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...grantBucketAccessForm}>
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="grid gap-4"
                      >
                        <FormField
                          control={grantBucketAccessForm.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User</FormLabel>
                              <FormControl>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        className="justify-between w-full"
                                      >
                                        {field.value
                                          ? users?.data.find((user) => user.id === field.value)?.email
                                          : 'Choose a user'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <Command>
                                      <CommandInput
                                        placeholder="Find a user"
                                        onValueChange={setSearchedUser}
                                      />
                                      <CommandList>
                                        {isUsersFetched && users?.data.length === 0 && (
                                          <CommandEmpty>No bucket found.</CommandEmpty>
                                        )}
                                        {isUsersLoading && <CommandLoading></CommandLoading>}
                                        {users?.data.map((user, index) => (
                                          <CommandItem
                                            key={`user-${user}-${index}`}
                                            value={user.id}
                                            onSelect={() => {
                                              console.log(grantBucketAccessForm.getValues());

                                              console.log(grantBucketAccessForm.formState.errors);

                                              grantBucketAccessForm.setValue('userId', user.id);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                'mr-2 h-4 w-4',
                                                user.id === field.value ? 'opacity-100' : 'opacity-0',
                                              )}
                                            />
                                            {user.email}
                                          </CommandItem>
                                        ))}
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          onClick={async () => {
                            await onGrantAccess({
                              ...grantBucketAccessForm.getValues(),
                              bucketName: bucket.name,
                            });
                          }}
                        >
                          Assign
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <AlertDialog
                  open={deleteBucketAlertDialogOpen}
                  onOpenChange={setDeleteBucketAlertDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button className="bg-red-800 hover:bg-red-700">Delete bucket</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          className="bg-red-800 hover:bg-red-700"
                          onClick={() => onDeleteBucket(bucket.name)}
                        >
                          Delete
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-start-3">
        <div className="pb-4">
          <div>Users</div>
          <Dialog
            open={createUserDialogOpen}
            onOpenChange={setCreateUserDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Create a user</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a user</DialogTitle>
              </DialogHeader>
              <Form {...createUserForm}>
                <form
                  className="grid gap-4"
                  onSubmit={createUserForm.handleSubmit(onCreateUser)}
                >
                  <FormField
                    control={createUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage></FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage></FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={!createUserForm.formState.isValid}
                    type="submit"
                  >
                    Create
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col gap-2">
          {users?.data.map((user) => (
            <div
              key={`user-${user.id}`}
              className="flex rounded-xl bg-zinc-700 p-2 text-white"
            >
              {user.email}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
