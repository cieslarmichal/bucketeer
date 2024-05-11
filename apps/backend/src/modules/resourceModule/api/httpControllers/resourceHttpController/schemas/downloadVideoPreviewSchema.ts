import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const downloadVideoPreviewPathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
  resourceId: Type.String({ format: 'uuid' }),
});

export type DownloadVideoPreviewPathParamsDTO = TypeExtends<
  Static<typeof downloadVideoPreviewPathParamsDTOSchema>,
  contracts.DownloadVideoPreviewPathParams
>;

export const downloadVideoPreviewResponseBodyDTOSchema = Type.Any();

export type DownloadVideoPreviewResponseBodyDTO = Static<typeof downloadVideoPreviewResponseBodyDTOSchema>;
