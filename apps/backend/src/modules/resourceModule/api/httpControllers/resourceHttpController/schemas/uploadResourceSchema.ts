import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const uploadResourcesPathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type UploadResourcesPathParamsDTO = TypeExtends<
  Static<typeof uploadResourcesPathParamsDTOSchema>,
  contracts.UploadResourcesPathParams
>;

export const uploadResourcesResponseBodyDTOSchema = Type.Null();

export type UploadResourcesResponseBodyDTO = Static<typeof uploadResourcesResponseBodyDTOSchema>;
