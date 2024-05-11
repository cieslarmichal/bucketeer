import { beforeEach, expect, describe, it } from 'vitest';

import { BlacklistTokenMapperImpl } from './blacklistTokenMapperImpl.js';
import { Generator } from '../../../../../../../tests/generator.js';
import { type BlacklistTokenRawEntity } from '../../../databases/userDatabase/tables/blacklistTokenTable/blacklistTokenRawEntity.js';

describe('BlacklistTokenMapperImpl', () => {
  let blacklistTokenMapperImpl: BlacklistTokenMapperImpl;

  beforeEach(async () => {
    blacklistTokenMapperImpl = new BlacklistTokenMapperImpl();
  });

  it('maps from BlacklistTokenRawEntity to BlacklistToken', async () => {
    const blacklistTokenEntity: BlacklistTokenRawEntity = {
      id: Generator.uuid(),
      token: Generator.alphaString(32),
      expiresAt: Generator.futureDate(),
    };

    const blacklistToken = blacklistTokenMapperImpl.mapToDomain(blacklistTokenEntity);

    expect(blacklistToken).toEqual({
      id: blacklistTokenEntity.id,
      token: blacklistTokenEntity.token,
      expiresAt: blacklistTokenEntity.expiresAt,
    });
  });
});
