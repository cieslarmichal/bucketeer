import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bucketDtoSchema } from './bucketDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBucketsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bucketDtoSchema),
});

export type FindBucketsResponseBodyDTO = TypeExtends<
  Static<typeof findBucketsResponseBodyDTOSchema>,
  contracts.FindBucketsResponseBody
>;
