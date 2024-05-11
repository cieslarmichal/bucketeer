import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bucketDtoSchema } from '../../adminResourceHttpController/schemas/bucketDto.js';

export const findUserBucketsQueryParamsDTOSchema = Type.Object({
  userId: Type.String(),
});

export type FindUserBucketsQueryParamsDTO = TypeExtends<
  Static<typeof findUserBucketsQueryParamsDTOSchema>,
  contracts.FindUserBucketsQueryParams
>;

export const findUserBucketsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bucketDtoSchema),
});

export type FindUserBucketsResponseBodyDTO = TypeExtends<
  Static<typeof findUserBucketsResponseBodyDTOSchema>,
  contracts.FindUserBucketsResponseBody
>;
