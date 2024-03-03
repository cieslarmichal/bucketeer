import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteUserPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type DeleteUserPathParamsDTO = TypeExtends<
  Static<typeof deleteUserPathParamsDTOSchema>,
  contracts.DeleteUserPathParams
>;

export const deleteUserResponseBodyDTOSchema = Type.Null();

export type DeleteUserResponseBodyDTO = Static<typeof deleteUserResponseBodyDTOSchema>;
