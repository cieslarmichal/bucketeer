import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../@/components/ui/form';
import { Input } from '../../../@/components/ui/input';
import { ApiError } from '../../modules/common/errors/apiError';
import { CookieService } from '../../modules/common/services/cookieService/cookieService';
import { type AppRouterContext } from '../../modules/core/router/routerContext';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';
import { useLoginUserMutation } from '../../modules/user/api/user/mutations/loginMutation/loginMutation';
import { useFindMeQuery } from '../../modules/user/api/user/queries/findMeQuery/findMeQuery';

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
  password: z.string().min(4),
});

function Login(): JSX.Element {
  const navigate = useNavigate();

  const accessToken = useUserTokensStore((state) => state.accessToken);

  const { refetch: refetchUserData } = useFindMeQuery({
    accessToken: accessToken as string,
  });

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const setUserTokens = useUserTokensStore((state) => state.setTokens);

  const [formError, setFormError] = useState<string | null>(null);

  const { mutateAsync } = useLoginUserMutation({});

  const onSubmit = async (values: z.infer<typeof loginFormSchema>): Promise<void> => {
    const { email, password } = values;

    setFormError(null);

    try {
      const result = await mutateAsync({ email, password });

      setUserTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      CookieService.setUserTokensCookie({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      });

      const userData = await refetchUserData({});

      CookieService.setUserDataCookie(JSON.stringify(userData.data));

      navigate({
        to: '/dashboard',
        search: {
          page: 0,
        },
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
