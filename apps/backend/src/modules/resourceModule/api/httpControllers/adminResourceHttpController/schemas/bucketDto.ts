import { Type, type Static } from '@sinclair/typebox';

export const bucketDtoSchema = Type.Object({
  name: Type.String(),
});

export type BucketDto = Static<typeof bucketDtoSchema>;
