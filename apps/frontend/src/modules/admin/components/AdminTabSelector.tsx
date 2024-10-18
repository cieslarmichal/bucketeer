import { useNavigate } from "@tanstack/react-router";
import { TrashIcon, UserIcon } from '@heroicons/react/24/solid';

export const AdminTabSelector = () => {
    const navigate = useNavigate();

    return (
    <div className="flex justify-center items-center gap-4">
        <div
          onClick={() =>
            navigate({
              to: '/admin/user',
            })
          }
          className="flex flex-col items-center gap-2 p-6 bg-primary-foreground rounded-md border border-primary cursor-pointer"
        >
          <UserIcon className="w-12 h-12 pointer-events-none"></UserIcon>
          <p className="text-primary pointer-events-none">Users</p>
        </div>
        <div
          onClick={() =>
            navigate({
              to: '/admin/bucket',
            })
          }
          className="flex flex-col items-center gap-2 p-6 bg-primary-foreground rounded-md border border-primary cursor-pointer"
        >
          <TrashIcon className="w-12 h-12 pointer-events-none"></TrashIcon>
          <p className="text-primary pointer-events-none">Buckets</p>
        </div>
      </div>  
    )
}
