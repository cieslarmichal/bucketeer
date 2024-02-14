import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBucketBodyDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type CreateBucketBodyDTO = TypeExtends<Static<typeof createBucketBodyDTOSchema>, contracts.CreateBucketBody>;

export const createBucketResponseBodyDTOSchema = Type.Null();

export type CreateBucketResponseBodyDTO = Static<typeof createBucketResponseBodyDTOSchema>;
