import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const downloadResourcePathParamsDTOSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export type DownloadResourcePathParamsDTO = TypeExtends<
  Static<typeof downloadResourcePathParamsDTOSchema>,
  contracts.DeleteResourcePathParams
>;

export const downloadResourceResponseBodyDTOSchema = Type.Any();

export type DownloadResourceResponseBodyDTO = Static<typeof downloadResourceResponseBodyDTOSchema>;
