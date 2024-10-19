import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userWithBucketsDTOSchema } from '../../common/userDTO.js';

export const findUsersQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindUsersQueryParamsDTO = TypeExtends<
  Static<typeof findUsersQueryParamsDTOSchema>,
  contracts.FindUsersQueryParams
>;

export const findUsersResponseBodyDTOSchema = Type.Object({
  data: Type.Array(userWithBucketsDTOSchema),
  metadata: Type.Object({
    page: Type.Integer(),
    pageSize: Type.Integer(),
    totalPages: Type.Integer(),
  }),
});

export type FindUsersResponseBodyDTO = TypeExtends<
  Static<typeof findUsersResponseBodyDTOSchema>,
  contracts.FindUsersWithBucketsResponseBody
>;
