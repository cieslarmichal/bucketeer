export interface FindResourcesPathParams {
  readonly bucketName: string;
}

export interface FindResourcesQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindResourcesResponseBody {
  readonly data: {
    readonly name: string;
    readonly updatedAt: Date;
    readonly contentSize: number;
  }[];
  readonly metadata: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };
}
