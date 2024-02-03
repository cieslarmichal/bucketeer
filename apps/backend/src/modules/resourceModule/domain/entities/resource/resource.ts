import { type Readable } from 'node:stream';

export interface Resource {
  readonly name: string;
  readonly updatedAt: Date;
  readonly contentSize: number;
  readonly contentType: string;
  readonly data: Readable;
}
