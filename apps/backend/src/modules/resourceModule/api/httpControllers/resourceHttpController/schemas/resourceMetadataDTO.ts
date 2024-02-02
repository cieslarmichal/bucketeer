import { Type, type Static } from '@sinclair/typebox';

export const resourceMetadataDTOSchema = Type.Object({
  name: Type.String(),
  updatedAt: Type.String(),
  contentSize: Type.Number(),
  contentType: Type.String(),
});

export type ResourceMetadataDTO = Static<typeof resourceMetadataDTOSchema>;
