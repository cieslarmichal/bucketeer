import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const refreshUserTokensBodyDTOSchema = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

export type RefreshUserTokensBodyDTO = TypeExtends<
  Static<typeof refreshUserTokensBodyDTOSchema>,
  contracts.RefreshUserTokensBody
>;

export const refreshUserTokensResponseBodyDTOSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Number(),
});

export type RefreshUserTokensResponseBodyDTO = TypeExtends<
  Static<typeof refreshUserTokensResponseBodyDTOSchema>,
  contracts.RefreshUserTokensResponseBody
>;
