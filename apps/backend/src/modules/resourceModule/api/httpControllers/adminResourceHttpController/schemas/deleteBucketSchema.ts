import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteBucketPathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type DeleteBucketPathParamsDTO = TypeExtends<
  Static<typeof deleteBucketPathParamsDTOSchema>,
  contracts.DeleteBucketPathParams
>;

export const deleteBucketResponseBodyDTOSchema = Type.Null();

export type DeleteBucketResponseBodyDTO = Static<typeof deleteBucketResponseBodyDTOSchema>;
