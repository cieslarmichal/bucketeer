import { type BlacklistToken } from '../../../../domain/entities/blacklistToken/blacklistToken.js';
import { type BlacklistTokenRawEntity } from '../../../databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';

export interface BlacklistTokenMapper {
  mapToDomain(rawEntity: BlacklistTokenRawEntity): BlacklistToken;
}
