export const BucketApiQueryKeys = {
  findBuckets: 'findBuckets',
  adminFindBuckets: 'adminFindBuckets',
} as const;

export type BucketApiQueryKeysEnum = keyof typeof BucketApiQueryKeys;
