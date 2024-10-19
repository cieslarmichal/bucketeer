import { useState } from "react";
import { userAccessTokenSelector, useUserTokensStore } from "../../../core/stores/userTokens/userTokens";
import { useToast } from "../../../../../@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGrantBucketAccessMutation } from "../../api/admin/mutations/grantUserBucketAccessMutation/grantUserBucketAccessMutation";
import { BucketApiQueryKeys } from "../../../bucket/api/bucketApiQueryKeys";
import { Button } from "../../../../../@/components/ui/button";

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
  
export const GrantAccessButton = ({ name, form, setDialogOpen }: GrantAccessButtonProps): JSX.Element => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const [bucketName] = useState(name);
  
    const { toast } = useToast();
  
    const queryClient = useQueryClient();
    const { mutateAsync: grantBucketAccessMutation } = useGrantBucketAccessMutation({});
  
    const onGrantAccess = async (
      payload: { userId: string, bucketName: string },
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

