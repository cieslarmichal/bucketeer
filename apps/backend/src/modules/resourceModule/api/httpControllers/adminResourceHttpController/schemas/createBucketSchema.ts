import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bucketDtoSchema } from './bucketDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBucketBodyDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type CreateBucketBodyDTO = TypeExtends<Static<typeof createBucketBodyDTOSchema>, contracts.CreateBucketBody>;

export const createBucketResponseBodyDTOSchema = bucketDtoSchema;

export type CreateBucketResponseBodyDTO = TypeExtends<
  Static<typeof createBucketResponseBodyDTOSchema>,
  contracts.CreateBucketResponseBody
>;
