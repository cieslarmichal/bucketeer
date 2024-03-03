import { type Readable } from 'node:stream';

export interface VideoPreview {
  readonly name: string;
  readonly contentType: string;
  readonly data: Readable;
}
