import { FC } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../../../../../../@/components/ui/dialog";
import { Button } from "../../../../../../../@/components/ui/button";
import { useUserTokensStore } from "../../../../../core/stores/userTokens/userTokens";
import { useBucketStore } from "../../../../../bucket/stores/bucketStore";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "../../../../../../../@/components/ui/loadingSpinner";
import { useRenameResourceMutation } from "../../../../api/user/mutations/renameResourceMutation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../../../../../@/components/ui/form";
import { Input } from "../../../../../../../@/components/ui/input";
import { allAllowedExtensions } from "../../../../../common/constants/fileExtensions";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    resourceId: string;
    oldResourceName: string;
}

const renameSchema = z.object({
    resourceName: z.string().min(1).max(50)
});

export const RenameResourceModal: FC<Props> = ({ 
    isOpen,
    onClose,
    onConfirm,
    resourceId,
    oldResourceName
    }) => {
        const queryClient = useQueryClient();

        const accessToken = useUserTokensStore((state) => state.accessToken);
        const { mutateAsync, isPending } = useRenameResourceMutation({});
        const bucketName = useBucketStore(bucket => bucket.bucket?.name) as string;

        const form = useForm({
            resolver: zodResolver(renameSchema),
            defaultValues: {
                resourceName: oldResourceName
            },
            reValidateMode: 'onBlur'
        });

        const getExtension = (name: string) => {
            const match = name.match(/\.([^.]+)$/);
            return match ? match[0].toLowerCase() : '';
        };

        const onSubmit = async (vals: z.infer<typeof renameSchema>) => {
            const oldExtension = getExtension(oldResourceName);
            const newExtension = getExtension(vals.resourceName);

            let resourceName = vals.resourceName;

            if (!newExtension || !allAllowedExtensions.includes(newExtension)) {
                resourceName += oldExtension;
            }

            await mutateAsync({
                accessToken: accessToken as string,
                bucketName,
                resourceId,
                resourceName,
            });

            queryClient.invalidateQueries({
                predicate: ({ queryKey }) => queryKey[0] === 'findBucketResources'
            })

            onConfirm();
        }

        const onModalClosed = () => {
            form.reset();
            onClose();
        }

        return (
            <Dialog open={isOpen} onOpenChange={onModalClosed}>
            <DialogContent className="lg:max-w-xl md:max-w-80 max-w-60">
                <DialogTitle>Rename resource</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField 
                            control={form.control}
                            name="resourceName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resource Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Bucket name"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <Button variant="ghost" onClick={onModalClosed}>Cancel</Button>
                <Button
                    type="submit"
                    onClick={async () => await onSubmit(form.getValues())}
                    disabled={isPending}
                    variant={isPending ? "outline" : "default"}
                    className="w-20"
                >
                    {isPending ? <LoadingSpinner></LoadingSpinner> : 'Confirm'}
                </Button>
                </div>
            </DialogContent>
            </Dialog>
        );
};
