import { type BlacklistTokenMapper } from './blacklistTokenMapper.js';
import { BlacklistToken } from '../../../../domain/entities/blacklistToken/blacklistToken.js';
import { type BlacklistTokenRawEntity } from '../../../databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';

export class BlacklistTokenMapperImpl implements BlacklistTokenMapper {
  public mapToDomain(entity: BlacklistTokenRawEntity): BlacklistToken {
    const { id, token, expiresAt } = entity;

    return new BlacklistToken({
      id,
      expiresAt: new Date(expiresAt),
      token,
    });
  }
}
