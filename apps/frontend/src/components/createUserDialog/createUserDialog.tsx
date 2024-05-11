import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../@/components/ui/form';
import { Input } from '../../../@/components/ui/input';
import { useCreateUserMutation } from '../../api/user/admin/mutations/createUserMutation/createUserMutation';
import { adminFindUsersQueryOptions } from '../../api/user/admin/queries/findUsersQuery/findUsersQueryOptions';
import { useUserTokensStore } from '../../core/stores/userTokens/userTokens';

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

const createUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/gi,
      'Password should have at least one uppercase letter, a number & minimum 8 characters',
    ),
});

export const CreateUserDialog = ({ onOpenChange, open }: Props): JSX.Element => {
  const accessToken = useUserTokensStore.getState().accessToken;

  const createUserForm = useForm({
    resolver: zodResolver(createUserSchema),
    values: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const { refetch: refetchUsers } = useQuery({
    ...adminFindUsersQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  const { mutateAsync: createUserMutation } = useCreateUserMutation({});

  const onCreateUser = async (payload: z.infer<typeof createUserSchema>): Promise<void> => {
    await createUserMutation({
      ...payload,
      accessToken: accessToken as string,
    });

    onOpenChange(false);

    createUserForm.reset();

    refetchUsers();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
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
  );
};
