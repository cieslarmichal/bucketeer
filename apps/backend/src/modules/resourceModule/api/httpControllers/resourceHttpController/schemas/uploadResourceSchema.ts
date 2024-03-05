import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const uploadResourcePathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type UploadResourcePathParamsDTO = TypeExtends<
  Static<typeof uploadResourcePathParamsDTOSchema>,
  contracts.UploadResourcePathParams
>;

export const uploadResourceBodyDTOSchema = Type.Any();

export type UploadResourceBodyDTO = Static<typeof uploadResourceBodyDTOSchema>;

export const uploadResourceResponseBodyDTOSchema = Type.Any();

export type UploadResourceResponseBodyDTO = Static<typeof uploadResourceResponseBodyDTOSchema>;
