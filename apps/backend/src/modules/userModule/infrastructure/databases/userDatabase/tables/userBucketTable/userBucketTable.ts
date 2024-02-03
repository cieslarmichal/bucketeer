import { type UserBucketRawEntity } from './userBucketRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class UserBucketTable implements DatabaseTable<UserBucketRawEntity> {
  public readonly name = 'userBuckets';
  public readonly columns = {
    id: 'id',
    userId: 'userId',
    bucketName: 'bucketName',
  } as const;
}
