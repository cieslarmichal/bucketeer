/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Knex } from 'knex';

export type QueryBuilder<T extends object = any, R extends object = any[]> = Knex.QueryBuilder<T, R>;
