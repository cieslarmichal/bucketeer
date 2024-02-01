import { type Static, Type } from '@sinclair/typebox';

export const checkHealthResponseBodySchema = Type.Object({
  healthy: Type.Boolean(),
  checks: Type.Array(
    Type.Object({
      name: Type.String(),
      healthy: Type.Boolean(),
    }),
  ),
});

export type CheckHealthResponseBody = Static<typeof checkHealthResponseBodySchema>;
