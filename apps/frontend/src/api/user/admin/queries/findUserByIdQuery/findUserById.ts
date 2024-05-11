import { type FindUserPathParams, type FindUserResponseBody } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';

export type FindUserByIdPayload = FindUserPathParams & {
  accessToken: string;
};

export async function findUserById(payload: FindUserByIdPayload): Promise<FindUserResponseBody> {
  const { accessToken, id } = payload;

  const response = await HttpService.get<FindUserResponseBody>({
    url: `/admin/api/users/${id}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }

  return response.body;
}
