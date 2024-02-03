import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const revokeBucketAccessPathParamsDTOSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export type RevokeBucketAccessPathParamsDTO = TypeExtends<
  Static<typeof revokeBucketAccessPathParamsDTOSchema>,
  contracts.RevokeBucketAccessPathParams
>;

export const revokeBucketAccessBodyDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type RevokeBucketAccessBodyDTO = TypeExtends<
  Static<typeof revokeBucketAccessBodyDTOSchema>,
  contracts.RevokeBucketAccessBody
>;

export const revokeBucketAccessResponseBodyDTOSchema = Type.Null();

export type RevokeBucketAccessResponseBodyDTO = Static<typeof revokeBucketAccessResponseBodyDTOSchema>;
