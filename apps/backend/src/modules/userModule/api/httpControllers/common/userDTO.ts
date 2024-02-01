import { Type, type Static } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

export const userDTOSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  role: Type.Enum(contracts.UserRole),
});

export type UserDTO = Static<typeof userDTOSchema>;
