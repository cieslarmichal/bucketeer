import { create } from 'zustand';
import { BucketState } from './bucketStoreState';

export const useBucketStore = create<BucketState>((set) => ({
    bucket: undefined,
    removeBucket: (): void => {
        set({});
    },
    setBucket: (bucket) => set({ bucket })
}));
