import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const downloadImagePathParamsDTOSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
});

export type DownloadImagePathParamsDTO = TypeExtends<
  Static<typeof downloadImagePathParamsDTOSchema>,
  contracts.DownloadImagePathParams
>;

export const downloadImageResponseBodyDTOSchema = Type.Any();

export type DownloadImageResponseBodyDTO = Static<typeof downloadImageResponseBodyDTOSchema>;
