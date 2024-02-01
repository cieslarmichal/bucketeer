import { Generator } from '@common/tests';

import { type RefreshTokenDraft, RefreshToken } from '../../../domain/entities/refreshToken/refreshToken.js';

export class RefreshTokenTestFactory {
  public create(input: Partial<RefreshTokenDraft> = {}): RefreshToken {
    return new RefreshToken({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      token: Generator.alphaString(32),
      expiresAt: Generator.futureDate(),
      ...input,
    });
  }
}
