import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';

import { DataTable } from '../../modules/common/components/dataTable/dataTable';
import { useUserTokensStore } from '../../modules/core/stores/userTokens/userTokens';
import { adminFindUsersQueryOptions } from '../../modules/user/api/admin/queries/findUsersQuery/findUsersQueryOptions';
import { CreateUserDialog } from '../../modules/user/components/createUserDialog/createUserDialog';
import { userTableColumns } from '../../modules/user/components/userTableColumns/userTableColumns';

export const Route = createFileRoute('/admin/user')({
  component: User,
});

function User(): ReactNode {
  const accessToken = useUserTokensStore.getState().accessToken;

  const [page, setPage] = useState(0);

  const [pageSize] = useState(10);

  const { data: users, isFetching } = useQuery({
    ...adminFindUsersQueryOptions({
      accessToken: accessToken as string,
    }),
  });

  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);

  if (isFetching) {
    return <div>Loading ...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="col-start-4 col-span-2">
        <div className="pb-4">
          <div>Users</div>
          <CreateUserDialog
            onOpenChange={setCreateUserDialogOpen}
            open={createUserDialogOpen}
          />
        </div>
        <DataTable
          columns={userTableColumns}
          data={users?.data ?? []}
          pageCount={1}
          pageIndex={page}
          pageSize={pageSize}
          onPreviousPage={() => setPage(page - 1)}
          onNextPage={() => setPage(page + 1)}
        />
      </div>
    </div>
  );
}
