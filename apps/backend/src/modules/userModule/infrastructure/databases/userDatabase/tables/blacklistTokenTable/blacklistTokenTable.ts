import { type BlacklistTokenRawEntity } from './blacklistTokenRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class BlacklistTokenTable implements DatabaseTable<BlacklistTokenRawEntity> {
  public readonly name = 'blacklistTokens';
  public readonly columns = {
    id: 'id',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;
}
