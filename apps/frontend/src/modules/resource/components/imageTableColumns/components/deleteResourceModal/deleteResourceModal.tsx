import { FC } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../../../../../../@/components/ui/dialog";
import { Button } from "../../../../../../../@/components/ui/button";
import { useDeleteResourceMutation } from "../../../../api/user/mutations/deleteResourceMutation";
import { useUserTokensStore } from "../../../../../core/stores/userTokens/userTokens";
import { useBucketStore } from "../../../../../bucket/stores/bucketStore";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "../../../../../../../@/components/ui/loadingSpinner";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    resourceId: string;
}

export const DeleteResourceModal: FC<Props> = ({ 
    isOpen,
    onClose,
    onConfirm,
    resourceId
    }) => {
        const queryClient = useQueryClient();

        const accessToken = useUserTokensStore((state) => state.accessToken);
        const { mutateAsync, isPending } = useDeleteResourceMutation({});
        const bucketName = useBucketStore(bucket => bucket.bucket?.name) as string;

        const onDelete = async () => {
            await mutateAsync({
                accessToken: accessToken as string,
                bucketName,
                resourceId,
            });

            queryClient.invalidateQueries({
                predicate: ({ queryKey }) => queryKey[0] === 'findBucketResources'
            })

            onConfirm();
        }

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="lg:max-w-xl md:max-w-80 max-w-60">
                <DialogTitle>Delete resource</DialogTitle>
                <p className="leading-8">Are you sure you want to delete this resource?
                    <br></br>
                    <span className="font-bold text-red-500">
                        This action cannot be undone!
                    </span>
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button 
                    disabled={isPending}
                    variant={isPending ? "outline" : "destructive"}
                    onClick={onDelete}
                    className="w-20"
                >
                    {isPending ? <LoadingSpinner></LoadingSpinner> : 'Confirm'}
                </Button>
                </div>
            </DialogContent>
            </Dialog>
        );
};
