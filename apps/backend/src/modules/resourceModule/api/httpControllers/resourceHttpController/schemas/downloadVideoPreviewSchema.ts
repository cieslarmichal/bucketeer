import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';
import { PreviewType } from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const downloadVideoPreviewPathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
  resourceId: Type.String({ format: 'uuid' }),
});

export type DownloadVideoPreviewPathParamsDTO = TypeExtends<
  Static<typeof downloadVideoPreviewPathParamsDTOSchema>,
  contracts.DownloadVideoPreviewPathParams
>;

export const downloadVideoPreviewQueryParamsDTOSchema = Type.Object({
  previewType: Type.Enum(PreviewType),
});

export type DownloadVideoPreviewQueryParamsDTO = TypeExtends<
  Static<typeof downloadVideoPreviewQueryParamsDTOSchema>,
  contracts.DownloadVideoPreviewQueryParams
>;

export const downloadVideoPreviewResponseBodyDTOSchema = Type.Any();

export type DownloadVideoPreviewResponseBodyDTO = Static<typeof downloadVideoPreviewResponseBodyDTOSchema>;
