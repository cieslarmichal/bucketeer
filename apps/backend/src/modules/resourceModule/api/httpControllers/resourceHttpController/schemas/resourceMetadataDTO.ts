import { Type, type Static } from '@sinclair/typebox';

export const resourceMetadataDTOSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  updatedAt: Type.Date(),
  contentSize: Type.Number(),
  contentType: Type.String(),
  url: Type.String(),
  previewUrl: Type.String(),
});

export type ResourceMetadataDTO = Static<typeof resourceMetadataDTOSchema>;
