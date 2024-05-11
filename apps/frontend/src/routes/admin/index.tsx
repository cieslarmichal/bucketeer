import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../@/components/ui/form';
import { Input } from '../../../@/components/ui/input';
import { useCreateBucketMutation } from '../../api/bucket/mutations/admin/createBucketMutation/createBucketMutation';
import { adminFindBucketsQueryOptions } from '../../api/bucket/queries/admin/adminFindBuckets/adminFindBucketsQueryOptions';
import { requireAdmin } from '../../core/auth/requireAdmin';
import { type AppRouterContext } from '../../core/router/routerContext';
import { userTokensStore } from '../../core/stores/userTokens/userTokens';

export const Route = createFileRoute('/admin/')({
  component: Admin,
  beforeLoad: ({ context }): void => {
    const appContext = context as AppRouterContext;

    requireAdmin(appContext);
  },
});

const createBucketSchema = z.object({
  bucketName: z
    .string()
    .min(3)
    .max(63)
    .regex(new RegExp(/^(?!\.\.)([a-z0-9])(?:[a-z0-9.-]*[a-z0-9])?$/, 'g')),
});

function Admin(): JSX.Element {
  const accessToken = userTokensStore.getState().accessToken;

  const { data, refetch: refetchBuckets } = useQuery({
    ...adminFindBucketsQueryOptions(accessToken as string),
  });

  const [createBucketDialogOpen, setCreateBucketDialogOpen] = useState(false);

  const { mutateAsync: createBucket } = useCreateBucketMutation({});

  const form = useForm({
    resolver: zodResolver(createBucketSchema),
    values: {
      bucketName: '',
    },
    mode: 'onChange',
  });

  const onCreateBucket = async (payload: z.infer<typeof createBucketSchema>): Promise<void> => {
    await createBucket({
      accessToken: accessToken as string,
      bucketName: payload.bucketName.toLowerCase(),
    });

    setCreateBucketDialogOpen(false);

    await refetchBuckets();
  };

  return (
    <div className="grid grid-cols-3">
      <div className="col-start-2">
        <div className="pb-4">
          <div>Buckets</div>
          <Dialog open={createBucketDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCreateBucketDialogOpen(!createBucketDialogOpen)}>Create a bucket</Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md"
              closeControl={() => setCreateBucketDialogOpen(false)}
            >
              <DialogHeader>
                <DialogTitle> Create a bucket </DialogTitle>
              </DialogHeader>
              <div>
                <Form {...form}>
                  <form
                    className="grid gap-4"
                    onSubmit={form.handleSubmit(onCreateBucket)}
                  >
                    <FormField
                      control={form.control}
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
                      disabled={!form.formState.isValid}
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
          {data?.map((bucket, index) => (
            <div
              className="flex rounded-xl bg-zinc-700 p-2 text-white"
              key={`bucket-${bucket}-${index}`}
            >
              <div className="flex items-center justify-between w-full px-2">
                <p>{bucket}</p>
                <Button>Assign access</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
