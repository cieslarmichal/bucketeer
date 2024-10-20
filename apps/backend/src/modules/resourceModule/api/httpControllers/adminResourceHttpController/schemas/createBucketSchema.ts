import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bucketDtoSchema } from './bucketDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createBucketBodyDTOSchema = Type.Object({
  bucketName: Type.String({
    pattern: '^(?!.*\\..*)([a-z0-9])(?:[a-z0-9.-]*[a-z0-9])?$',

    minLength: 3,
    /**
     * JB
     * Has to be 54, as we are adding `-previews` to a newly created bucket
     * And we are causing an error down the drain
     */
    maxLength: 54,
  }),
});

export type CreateBucketBodyDTO = TypeExtends<Static<typeof createBucketBodyDTOSchema>, contracts.CreateBucketBody>;

export const createBucketResponseBodyDTOSchema = bucketDtoSchema;

export type CreateBucketResponseBodyDTO = TypeExtends<
  Static<typeof createBucketResponseBodyDTOSchema>,
  contracts.CreateBucketResponseBody
>;
