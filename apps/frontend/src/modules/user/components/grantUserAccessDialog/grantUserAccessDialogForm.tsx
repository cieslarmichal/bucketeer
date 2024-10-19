import { FC, useState } from "react";
import { userAccessTokenSelector, useUserTokensStore } from "../../../core/stores/userTokens/userTokens";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { adminFindUsersQueryOptions } from "../../api/admin/queries/findUsersQuery/findUsersQueryOptions";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../../../@/components/ui/form";
import { DialogPopoverContent, Popover, PopoverTrigger } from "../../../../../@/components/ui/popover";
import { Button } from "../../../../../@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "../../../../../@/components/ui/command";
import { CommandLoading } from "cmdk";
import { cn } from "../../../../../@/lib/utils";
import { GrantAccessButton } from "./grantUserAccessButton";

const grantBucketAccessSchema = z.object({
    userId: z.string().uuid(),
});
  
interface GrantUserAccessDialogFormProps {
    bucketName: string;
    onConfirm: (val: boolean) => void;
  }
export const GrantUserAccessDialogForm: FC<GrantUserAccessDialogFormProps> = ({ bucketName, onConfirm}) => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const [popoverOpen, setPopoverOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [__, setSearchedUser] = useState('');
  
    const grantBucketAccessForm = useForm({
      resolver: zodResolver(grantBucketAccessSchema),
      values: {
        userId: '',
      },
      mode: 'onChange',
    });
  
    const {
      data: users,
      isFetched: isUsersFetched,
      isLoading: isUsersLoading,
    } = useQuery({
      ...adminFindUsersQueryOptions({
        accessToken,
        pageSize: 1000,
      }),
    });
  
    const onGrantAccess = (val: boolean) => {
      onConfirm(val);
      if (val === false) {
        setPopoverOpen(false);
      }
    }
  
    return (
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
            setDialogOpen={onGrantAccess}
            name={bucketName}
          />
        </form>
    </Form>
    )
}
