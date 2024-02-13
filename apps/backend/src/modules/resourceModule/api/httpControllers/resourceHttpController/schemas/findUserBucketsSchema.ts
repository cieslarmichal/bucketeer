import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBucketsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(Type.String()),
});

export type FindUserBucketsResponseBodyDTO = TypeExtends<
  Static<typeof findUserBucketsResponseBodyDTOSchema>,
  contracts.FindUserBucketsResponseBody
>;
