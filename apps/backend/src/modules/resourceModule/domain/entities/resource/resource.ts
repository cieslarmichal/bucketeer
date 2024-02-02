import { type Readable } from 'node:stream';

export interface Resource {
  readonly name: string;
  readonly updatedAt: string;
  readonly contentSize: number;
  readonly contentType: string;
  readonly data: Readable;
}
