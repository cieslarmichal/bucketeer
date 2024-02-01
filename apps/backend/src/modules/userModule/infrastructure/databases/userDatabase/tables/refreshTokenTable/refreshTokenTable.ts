import { type RefreshTokenRawEntity } from './refreshTokenRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class RefreshTokenTable implements DatabaseTable<RefreshTokenRawEntity> {
  public readonly name = 'refreshTokens';
  public readonly columns = {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;
}
