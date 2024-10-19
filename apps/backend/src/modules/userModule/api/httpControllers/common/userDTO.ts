import { Type, type Static } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

export const userDTOSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  role: Type.Enum(contracts.UserRole),
});

export const userWithBucketsDTOSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  role: Type.Enum(contracts.UserRole),
  buckets: Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      bucketName: Type.String(),
      userId: Type.String({ format: 'uuid' }),
    }),
  ),
});

export type UserDTO = Static<typeof userDTOSchema>;

export type UserWithBucketsDTO = Static<typeof userWithBucketsDTOSchema>;
