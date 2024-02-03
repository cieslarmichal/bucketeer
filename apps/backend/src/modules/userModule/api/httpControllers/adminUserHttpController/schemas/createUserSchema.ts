import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDTOSchema } from '../../common/userDTO.js';

export const createUserBodyDTOSchema = Type.Object({
  email: Type.String({
    format: 'email',
    minLength: 1,
  }),
  password: Type.String({ minLength: 1 }),
});

export type CreateUserBodyDTO = TypeExtends<Static<typeof createUserBodyDTOSchema>, contracts.CreateUserBody>;

export const createUserResponseBodyDTOSchema = userDTOSchema;

export type CreateUserResponseBodyDTO = TypeExtends<
  Static<typeof createUserResponseBodyDTOSchema>,
  contracts.CreateUserResponseBody
>;
