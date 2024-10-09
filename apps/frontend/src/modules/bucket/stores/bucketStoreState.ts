import { Bucket } from '@common/contracts';

export interface BucketState {
  bucket?: Bucket;
  setBucket: (bucket: Bucket) => void;
  removeBucket: () => void;
}
