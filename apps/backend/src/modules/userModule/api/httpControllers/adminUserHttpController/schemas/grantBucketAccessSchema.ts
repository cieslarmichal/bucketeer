import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const grantBucketAccessPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type GrantBucketAccessPathParamsDTO = TypeExtends<
  Static<typeof grantBucketAccessPathParamsDTOSchema>,
  contracts.GrantBucketAccessPathParams
>;

export const grantBucketAccessBodyDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type GrantBucketAccessBodyDTO = TypeExtends<
  Static<typeof grantBucketAccessBodyDTOSchema>,
  contracts.GrantBucketAccessBody
>;

export const grantBucketAccessResponseBodyDTOSchema = Type.Null();

export type GrantBucketAccessResponseBodyDTO = Static<typeof grantBucketAccessResponseBodyDTOSchema>;
