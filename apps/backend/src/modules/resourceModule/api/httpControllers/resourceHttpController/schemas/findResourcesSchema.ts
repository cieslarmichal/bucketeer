import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { resourceMetadataDTOSchema } from './resourceMetadataDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findResourcesPathParamsDTOSchema = Type.Object({
  bucketName: Type.String({ minLength: 1 }),
});

export type FindResourcesPathParamsDTO = TypeExtends<
  Static<typeof findResourcesPathParamsDTOSchema>,
  contracts.FindResourcesPathParams
>;

export const findResourcesQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindResourcesQueryParamsDTO = TypeExtends<
  Static<typeof findResourcesQueryParamsDTOSchema>,
  contracts.FindResourcesQueryParams
>;

export const findResourcesResponseBodyDTOSchema = Type.Object({
  data: Type.Array(resourceMetadataDTOSchema),
  metadata: Type.Object({
    page: Type.Integer(),
    pageSize: Type.Integer(),
    totalPages: Type.Integer(),
  }),
});

export type FindResourcesResponseBodyDTO = TypeExtends<
  Static<typeof findResourcesResponseBodyDTOSchema>,
  contracts.FindResourcesResponseBody
>;
