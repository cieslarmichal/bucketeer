import { S3, type S3ClientConfig } from '@aws-sdk/client-s3';

import { type S3Client } from '../../clients/s3Client/s3Client.js';
import { type S3Config } from '../../types/s3Config.js';

export class S3ClientFactory {
  public static create(config: S3Config): S3Client {
    const { region, endpoint } = config;

    let s3SdkConfig: S3ClientConfig = {
      region,
      forcePathStyle: true,
    };

    if (endpoint) {
      s3SdkConfig = {
        ...s3SdkConfig,
        endpoint,
      };
    }

    return new S3(s3SdkConfig);
  }
}
