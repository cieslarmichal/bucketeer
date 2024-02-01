import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDTOSchema } from '../../common/userDTO.js';

export const findUserPathParamsDTOSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
});

export type FindUserPathParamsDTO = TypeExtends<
  Static<typeof findUserPathParamsDTOSchema>,
  contracts.FindUserPathParams
>;

export const findUserResponseBodyDTOSchema = userDTOSchema;

export type FindUserResponseBodyDTO = TypeExtends<
  Static<typeof findUserResponseBodyDTOSchema>,
  contracts.FindUserResponseBody
>;
