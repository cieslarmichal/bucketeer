import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBucketQueryParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type DeleteBucketQueryParamsDTO = TypeExtends<
  Static<typeof deleteBucketQueryParamsDTOSchema>,
  contracts.DeleteBucketQueryParams
>;

export const deleteBucketResponseBodyDTOSchema = Type.Null();

export type DeleteBucketResponseBodyDTO = Static<typeof deleteBucketResponseBodyDTOSchema>;
