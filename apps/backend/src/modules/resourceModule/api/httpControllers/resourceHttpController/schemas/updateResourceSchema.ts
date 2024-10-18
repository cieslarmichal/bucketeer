import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateResourcePathParamsDTOSchema = Type.Object({
  bucketName: Type.String(),
  resourceId: Type.String({ format: 'uuid' }),
});

export type UpdateResourcePathParamsDTO = TypeExtends<
  Static<typeof updateResourceBodyDTOSchema>,
  contracts.UpdateResourcePathParams
>;

export const updateResourceBodyDTOSchema = Type.Object({
  resourceName: Type.String(),
});

export type UpdateResourceBodyDTO = TypeExtends<
  Static<typeof updateResourceBodyDTOSchema>,
  contracts.UpdateResourceBody
>;

export const updateResourcesResponseBodyDTOSchema = Type.Null();

export type UpdateResourcesResponseBodyDTO = Static<typeof updateResourcesResponseBodyDTOSchema>;
