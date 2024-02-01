import { type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { userDTOSchema } from '../../common/userDTO.js';

export const findMyUserResponseBodyDTOSchema = userDTOSchema;

export type FindMyUserResponseBodyDTO = TypeExtends<
  Static<typeof findMyUserResponseBodyDTOSchema>,
  contracts.FindMyUserResponseBody
>;
