import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteResourcePathParamsDTOSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export type DeleteResourcePathParamsDTO = TypeExtends<
  Static<typeof deleteResourcePathParamsDTOSchema>,
  contracts.DeleteResourcePathParams
>;

export const deleteResourceResponseBodyDTOSchema = Type.Null();

export type DeleteResourceResponseBodyDTO = Static<typeof deleteResourceResponseBodyDTOSchema>;
