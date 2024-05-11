import { type FindMyUserResponseBody } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';

interface FindMePayload {
  accessToken: string;
}

export async function findMe(payload: FindMePayload): Promise<FindMyUserResponseBody> {
  const { accessToken } = payload;

  const response = await HttpService.get<FindMyUserResponseBody>({
    url: 'api/users/me',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }

  return response.body;
}
