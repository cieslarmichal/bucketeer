import { type FindUsersQueryParams, type FindUsersResponseBody } from '@common/contracts';

import { HttpService } from '../../../../../common/services/httpService/httpService';

export type AdminFindUsersPayload = FindUsersQueryParams & {
  accessToken: string;
};

export const adminFindUsers = async (payload: AdminFindUsersPayload): Promise<FindUsersResponseBody> => {
  const { accessToken, page, pageSize } = payload;

  let queryParams: Record<string, string> = {};

  if (page) {
    queryParams = {
      ...queryParams,
      page: `${page}`,
    };
  }

  if (pageSize) {
    queryParams = {
      ...queryParams,
      pageSize: `${pageSize}`,
    };
  }

  const response = await HttpService.get<FindUsersResponseBody>({
    url: `/admin/users`,
    queryParams,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }

  return response.body;
};
