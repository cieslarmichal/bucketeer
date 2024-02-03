import { Type, type Static } from '@sinclair/typebox';

export const resourceMetadataDTOSchema = Type.Object({
  name: Type.String(),
  updatedAt: Type.Date(),
  contentSize: Type.Number(),
});

export type ResourceMetadataDTO = Static<typeof resourceMetadataDTOSchema>;
