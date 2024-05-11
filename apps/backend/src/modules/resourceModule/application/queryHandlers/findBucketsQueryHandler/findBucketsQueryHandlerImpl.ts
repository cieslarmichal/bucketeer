import { ListBucketsCommand } from '@aws-sdk/client-s3';

import { type FindBucketsQueryHandler, type FindBucketsQueryHandlerResult } from './findBucketsQueryHandler.js';
import { type S3Client } from '../../../../../libs/s3/clients/s3Client/s3Client.js';

export class FindBucketsQueryHandlerImpl implements FindBucketsQueryHandler {
  public constructor(private readonly s3Client: S3Client) {}

  public async execute(): Promise<FindBucketsQueryHandlerResult> {
    const result = await this.s3Client.send(new ListBucketsCommand({}));

    if (!result.Buckets) {
      return {
        buckets: [],
      };
    }

    const buckets = result.Buckets.map((bucket) => ({ name: bucket.Name as string }));

    return { buckets };
  }
}
