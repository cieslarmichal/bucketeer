import { Type, type Static } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const exportResourcesBodyDTOSchema = Type.Object({
  names: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
});

export type ExportResourcesBodyDTO = TypeExtends<
  Static<typeof exportResourcesBodyDTOSchema>,
  contracts.ExportResourcesBody
>;

export const exportResourcesResponseBodyDTOSchema = Type.Any();

export type ExportResourcesResponseBodyDTO = Static<typeof exportResourcesResponseBodyDTOSchema>;
