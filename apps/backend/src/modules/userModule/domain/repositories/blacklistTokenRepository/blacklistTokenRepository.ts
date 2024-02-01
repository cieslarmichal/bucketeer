import { type BlacklistToken } from '../../entities/blacklistToken/blacklistToken.js';

export interface CreateBlacklistTokenPayload {
  readonly token: string;
  readonly expiresAt: Date;
}

export interface FindBlacklistTokenPayload {
  readonly token: string;
}

export interface BlacklistTokenRepository {
  createBlacklistToken(input: CreateBlacklistTokenPayload): Promise<BlacklistToken>;
  findBlacklistToken(input: FindBlacklistTokenPayload): Promise<BlacklistToken | null>;
}
