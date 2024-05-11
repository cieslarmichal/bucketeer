import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const downloadResourcePathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
  resourceId: Type.String({ format: 'uuid' }),
});

export type DownloadResourcePathParamsDTO = TypeExtends<
  Static<typeof downloadResourcePathParamsDTOSchema>,
  contracts.DownloadResourcePathParams
>;

export const downloadResourceResponseBodyDTOSchema = Type.Any();

export type DownloadResourceResponseBodyDTO = Static<typeof downloadResourceResponseBodyDTOSchema>;
