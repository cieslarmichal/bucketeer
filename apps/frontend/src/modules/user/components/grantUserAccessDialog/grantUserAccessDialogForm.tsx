import { FC, useCallback, useState } from "react";
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
import { UserWithBuckets } from "@common/contracts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip";

const grantBucketAccessSchema = z.object({
    userId: z.string().uuid(),
});

interface UserItemProps {
    user: UserWithBuckets;
    index: number;
    bucketName: string;
    currentValue: string;
    hasUserAccessToBucket: (user: UserWithBuckets, bucketName: string) => boolean;
    onValueSelected: (userId: string) => void;
}
const UserItem: FC<UserItemProps> = ({ onValueSelected, hasUserAccessToBucket, currentValue, index, bucketName, user }) => {
    return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <CommandItem
                key={`user-${user}-${index}`}
                value={user.id}
                onSelect={() => onValueSelected(user.id)}
                disabled={hasUserAccessToBucket(user, bucketName)}
                className="w-full truncate cursor-default"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    user.id === currentValue ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className={cn("truncate", hasUserAccessToBucket(user, bucketName) ? 'opacity-50' : '')}>
                  {user.email}
                </span>
              </CommandItem>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            {hasUserAccessToBucket(user, bucketName)
              ? <div className="max-w-60">
                    <span>{user.email} already has access to <br></br> {bucketName}</span>
                </div>
              : <div className="max-w-60">
                    <span>Add {user.email} to <br></br>{bucketName}</span>
                </div>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
}

interface UserSelectorProps {
    users: UserWithBuckets[],
    bucketName: string,
    onValueSelected: (userId: string) => void;
    currentValue: string;
    isFetching: boolean;
    isLoading: boolean;
}
const UserSelector: FC<UserSelectorProps> = ({ currentValue, isFetching, isLoading, onValueSelected, users, bucketName }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [__, setSearchedUser] = useState('');

    const hasUserAccessToBucket = useCallback((user: UserWithBuckets, bucketName: string) => {
        return !user?.buckets?.findIndex((bucket) => bucket.bucketName === bucketName);
    }, [
        users,
        bucketName
    ])

    return (
        <Command>
            <CommandInput
            placeholder="Find a user"
            onValueChange={setSearchedUser}
            />
            <CommandList>
            {isFetching && users.length === 0 && (
                <CommandEmpty>No bucket found.</CommandEmpty>
            )}
            {isLoading && <CommandLoading></CommandLoading>}
            {users.map((user, index) => (
                <UserItem 
                    bucketName={bucketName}
                    currentValue={currentValue}
                    hasUserAccessToBucket={hasUserAccessToBucket}
                    index={index}
                    onValueSelected={onValueSelected}
                    user={user}
                />
            ))}
            </CommandList>
        </Command>
    );
}

interface GrantUserAccessDialogFormProps {
    bucketName: string;
    onConfirm: (val: boolean) => void;
  }
export const GrantUserAccessDialogForm: FC<GrantUserAccessDialogFormProps> = ({ bucketName, onConfirm}) => {
    const accessToken = useUserTokensStore(userAccessTokenSelector);
    const [popoverOpen, setPopoverOpen] = useState(false);
  
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
                      <UserSelector
                        bucketName={bucketName}
                        users={users?.data ?? []}
                        isFetching={isUsersFetched}
                        isLoading={isUsersLoading}
                        currentValue={field.value}
                        onValueSelected={(val) => grantBucketAccessForm.setValue('userId', val)} />
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
