import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const loginUserBodyDTOSchema = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
  }),
  password: Type.String({ minLength: 1 }),
});

export type LoginUserBodyDTO = TypeExtends<Static<typeof loginUserBodyDTOSchema>, contracts.LoginUserBody>;

export const loginUserResponseBodyDTOSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});

export type LoginUserResponseBodyDTO = TypeExtends<
  Static<typeof loginUserResponseBodyDTOSchema>,
  contracts.LoginUserResponseBody
>;
