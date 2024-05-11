import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bucketDtoSchema } from './bucketDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBucketsQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Number()),
  pageSize: Type.Optional(Type.Number()),
});

export type FindBucketsQueryParamsDTO = TypeExtends<
  Static<typeof findBucketsQueryParamsDTOSchema>,
  contracts.FindBucketsQueryParams
>;

export const findBucketsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bucketDtoSchema),
  metadata: Type.Object({
    page: Type.Number(),
    pageSize: Type.Number(),
    totalPages: Type.Number(),
  }),
});

export type FindBucketsResponseBodyDTO = TypeExtends<
  Static<typeof findBucketsResponseBodyDTOSchema>,
  contracts.FindBucketsResponseBody
>;
