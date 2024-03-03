import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../@/components/ui/form';
import { Input } from '../../../@/components/ui/input';
import { useLoginUserMutation } from '../../api/user/all/mutations/loginMutation/loginMutation';
import { ApiError } from '../../common/errors/apiError';
import { type AppRouterContext } from '../../core/router/routerContext';
import { UserTokensStoreContext } from '../../core/stores/userTokens/userTokens';

export const Route = createFileRoute('/login/')({
  component: Login,
  beforeLoad: ({ context }) => {
    const routerContext = context as AppRouterContext;

    if (routerContext.authenticated) {
      throw redirect({
        to: '/',
      });
    }
  },
});

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function Login(): JSX.Element {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const userTokensStore = useContext(UserTokensStoreContext);

  const [formError, setFormError] = useState<string | null>(null);

  const { mutateAsync } = useLoginUserMutation({});

  const onSubmit = async (values: z.infer<typeof loginFormSchema>): Promise<void> => {
    const { email, password } = values;

    setFormError(null);

    try {
      const result = await mutateAsync({ email, password });

      userTokensStore.setState({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      navigate({
        to: '/',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.context.message);
      } else {
        setFormError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-96">
        <Form {...form}>
          <form
            className="flex flex-col gap-6 p-8 sm:p-2 pt-16"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={!form.formState.isValid}
              type="submit"
            >
              Login
            </Button>
            {formError && <FormMessage>{formError}</FormMessage>}
          </form>
        </Form>
      </div>
    </div>
  );
}
