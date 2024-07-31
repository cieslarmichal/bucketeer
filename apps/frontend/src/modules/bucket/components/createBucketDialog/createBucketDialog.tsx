import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../../../@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../../@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../@/components/ui/form';
import { Input } from '../../../../../@/components/ui/input';
import { useToast } from '../../../../../@/components/ui/use-toast';
import { useUserTokensStore } from '../../../core/stores/userTokens/userTokens';
import { useCreateBucketMutation } from '../../api/admin/mutations/createBucketMutation/createBucketMutation';
import { adminFindBucketsQueryOptions } from '../../api/admin/queries/adminFindBuckets/adminFindBucketsQueryOptions';
import { BucketApiQueryKeys } from '../../api/bucketApiQueryKeys';

const bucketSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(new RegExp(/^(?!.*\.\.)([a-z0-9])(?:[a-z0-9.-]*[a-z0-9])?$/, 'g'));

const createBucketSchema = z.object({
  bucketName: bucketSchema,
});

interface CreateBucketDialogProps {
  dialogOpen: boolean;
  onOpenChange: (change: boolean) => void;
}

export const CreateBucketDialog = ({ dialogOpen, onOpenChange }: CreateBucketDialogProps): JSX.Element => {
  const accessToken = useUserTokensStore.getState().accessToken;

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const createBucketForm = useForm({
    resolver: zodResolver(createBucketSchema),
    values: {
      bucketName: '',
    },
    mode: 'onChange',
  });

  const { refetch: refetchBuckets } = useQuery({
    ...adminFindBucketsQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  const { mutateAsync: createBucketMutation } = useCreateBucketMutation({});

  const onCreateBucket = async (payload: z.infer<typeof createBucketSchema>): Promise<void> => {
    try {
      await createBucketMutation({
        accessToken: accessToken as string,
        bucketName: payload.bucketName.toLowerCase(),
      });

      // todo: add buckets invalidation

      onOpenChange(false);

      createBucketForm.reset();

      await refetchBuckets();

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === BucketApiQueryKeys.adminFindBuckets,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Something went wrong.',
          description: error.message,
        });
      }

      toast({
        title: 'Something went wrong.',
      });

      throw error;
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button onClick={() => onOpenChange(!dialogOpen)}>Create a bucket</Button>
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
  );
};
