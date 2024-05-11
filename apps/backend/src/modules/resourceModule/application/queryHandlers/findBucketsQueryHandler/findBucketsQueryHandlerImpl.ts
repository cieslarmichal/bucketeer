import { ListBucketsCommand } from '@aws-sdk/client-s3';

import {
  type FindBucketsQueryHandlerPayload,
  type FindBucketsQueryHandler,
  type FindBucketsQueryHandlerResult,
} from './findBucketsQueryHandler.js';
import { type S3Client } from '../../../../../libs/s3/clients/s3Client/s3Client.js';

export class FindBucketsQueryHandlerImpl implements FindBucketsQueryHandler {
  public constructor(private readonly s3Client: S3Client) {}

  public async execute(payload: FindBucketsQueryHandlerPayload): Promise<FindBucketsQueryHandlerResult> {
    const { page, pageSize } = payload;

    const result = await this.s3Client.send(new ListBucketsCommand({}));

    if (!result.Buckets) {
      return {
        buckets: [],
        totalPages: 0,
      };
    }

    const buckets = result.Buckets.slice((page - 1) * pageSize, page * pageSize).map((bucket) => ({
      name: bucket.Name as string,
    }));

    return {
      buckets,
      totalPages: Math.ceil(result.Buckets.length / pageSize),
    };
  }
}
