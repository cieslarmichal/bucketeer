import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CommandLoading } from 'cmdk';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../../../@/components/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../../../../../@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../../../../../@/components/ui/form';
import { DialogPopoverContent, Popover, PopoverTrigger } from '../../../../../@/components/ui/popover';
import { useToast } from '../../../../../@/components/ui/use-toast';
import { cn } from '../../../../../@/lib/utils';
import { BucketApiQueryKeys } from '../../../bucket/api/bucketApiQueryKeys';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useGrantBucketAccessMutation } from '../../api/admin/mutations/grantUserBucketAccessMutation/grantUserBucketAccessMutation';
import { adminFindUsersQueryOptions } from '../../api/admin/queries/findUsersQuery/findUsersQueryOptions';

interface GrantAccessButtonProps {
  name: string;
  form: {
    reset: () => void;
    getValues: () => {
      userId: string;
    };
  };
  setDialogOpen: (val: boolean) => void;
}

const grantBucketAccessSchema = z.object({
  userId: z.string().uuid(),
});

const GrantAccessButton = ({ name, form, setDialogOpen }: GrantAccessButtonProps): JSX.Element => {
  const accessToken = useUserTokensStore.getState().accessToken;

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [bucketName] = useState(name);

  const { mutateAsync: grantBucketAccessMutation } = useGrantBucketAccessMutation({});

  const onGrantAccess = async (
    payload: z.infer<typeof grantBucketAccessSchema> & { bucketName: string },
  ): Promise<void> => {
    if (!payload.bucketName) {
      return;
    }

    try {
      await grantBucketAccessMutation({
        accessToken: accessToken as string,
        bucketName: payload.bucketName,
        id: payload.userId,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Something went wrong.',
          description: error.message || 'Unknown error',
          variant: 'destructive',
        });

        return;
      }

      toast({
        title: 'Something went wrong.',
        description: 'Unknown error',
        variant: 'destructive',
      });

      return;
    }

    setDialogOpen(false);

    form.reset();

    await queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === BucketApiQueryKeys.findBuckets,
    });
  };

  return (
    <Button
      onClick={async () => {
        await onGrantAccess({
          ...form.getValues(),
          bucketName,
        });
      }}
    >
      Grant
    </Button>
  );
};

interface GrantUserAccessDialog {
  bucketName: string;
}

export const GrantUserAccessDialog = ({ bucketName }: GrantUserAccessDialog): JSX.Element => {
  const accessToken = useUserTokensStore.getState().accessToken;

  const [open, setOpen] = useState(false);

  const [popoverOpen, setPopoverOpen] = useState(false);

  const onOpenChange = (val: boolean): void => {
    setOpen(val);

    if (val === false) {
      setPopoverOpen(false);
    }
  };

  const grantBucketAccessForm = useForm({
    resolver: zodResolver(grantBucketAccessSchema),
    values: {
      userId: '',
    },
    mode: 'onChange',
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [__, setSearchedUser] = useState('');

  const {
    data: users,
    isFetched: isUsersFetched,
    isLoading: isUsersLoading,
  } = useQuery({
    ...adminFindUsersQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button>Grant access</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Assign access to bucket <b>{bucketName}</b>{' '}
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
                    <Popover
                      open={popoverOpen}
                      onOpenChange={setPopoverOpen}
                      modal={false}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between w-full"
                          >
                            {field.value ? users?.data.find((user) => user.id === field.value)?.email : 'Choose a user'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <DialogPopoverContent>
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
                                  grantBucketAccessForm.setValue('userId', user.id);
                                }}
                              >
                                <Check
                                  className={cn('mr-2 h-4 w-4', user.id === field.value ? 'opacity-100' : 'opacity-0')}
                                />
                                {user.email}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </DialogPopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )}
            />
            <GrantAccessButton
              form={grantBucketAccessForm}
              setDialogOpen={setOpen}
              name={bucketName}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
