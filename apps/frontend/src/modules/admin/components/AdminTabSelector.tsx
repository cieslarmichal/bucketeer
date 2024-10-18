import { useNavigate } from "@tanstack/react-router";
import { TrashIcon, UserIcon } from '@heroicons/react/24/solid';
import { cn } from "../../../../@/lib/utils";
import { FC, useMemo } from "react";

interface AdminTabSelectorProps {
  currentlySelected: 'bucket' | 'user' | 'none';
}

export const AdminTabSelector: FC<AdminTabSelectorProps> = ({ currentlySelected }) => {
    const navigate = useNavigate();

    const bucketSelected = useMemo(() => currentlySelected === 'bucket', [currentlySelected]);

    const userSelected = useMemo(() => currentlySelected === 'user', [currentlySelected]);

    return (
    <div className="flex justify-center items-center gap-4">
        <div
          onClick={() =>
            navigate({
              to: '/admin/user',
            })
          }
          className={cn("flex flex-col items-center gap-2 p-4 bg-primary-foreground rounded-md border border-primary cursor-pointer", userSelected && 'bg-muted border-accent pointer-events-none')}
        >
          <UserIcon className={cn("w-7 h-7 pointer-events-none", userSelected && "text-secondary-foreground")}></UserIcon>
          <p className="text-primary pointer-events-none">Users</p>
        </div>
        <div
          onClick={() =>
            navigate({
              to: '/admin/bucket',
            })
          }
          className={cn("flex flex-col items-center gap-2 p-4 bg-primary-foreground rounded-md border border-primary cursor-pointer", bucketSelected && 'bg-muted border-accent pointer-events-none')}
        >
          <TrashIcon className={cn("w-7 h-7 pointer-events-none", bucketSelected && "text-secondary-foreground")}></TrashIcon>
          <p className="text-primary pointer-events-none">Buckets</p>
        </div>
      </div>  
    )
}
