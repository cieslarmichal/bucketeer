import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBucketsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(Type.String()),
});

export type FindBucketsResponseBodyDTO = TypeExtends<
  Static<typeof findBucketsResponseBodyDTOSchema>,
  contracts.FindUserBucketsResponseBody
>;
