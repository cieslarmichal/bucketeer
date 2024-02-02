import { type AwsRegion } from '../../../common/types/awsRegion.js';

export interface S3Config {
  readonly region: AwsRegion;
  readonly endpoint?: string | undefined;
}
