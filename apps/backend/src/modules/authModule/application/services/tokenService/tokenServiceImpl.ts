/* eslint-disable import/no-named-as-default-member */

import jwt from 'jsonwebtoken';

import {
  type CreateTokenPayload,
  type VerifyTokenPayload,
  type TokenService,
  type DecodeTokenPayload,
  type DecodeTokenResult,
} from './tokenService.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type Config } from '../../../../../core/config.js';

export class TokenServiceImpl implements TokenService {
  public constructor(private readonly config: Config) {}

  public createToken(payload: CreateTokenPayload): string {
    const { data, expiresIn } = payload;

    const token = jwt.sign(data, this.config.token.secret, {
      expiresIn,
      algorithm: 'HS512',
    });

    return token;
  }

  public verifyToken(payload: VerifyTokenPayload): Record<string, string> {
    const { token } = payload;

    try {
      const data = jwt.verify(token, this.config.token.secret, { algorithms: ['HS512'] });

      return data as Record<string, string>;
    } catch (error) {
      throw new OperationNotValidError({
        reason: 'Token is not valid.',
        token,
      });
    }
  }

  public decodeToken(payload: DecodeTokenPayload): DecodeTokenResult {
    const { token } = payload;

    const decodedToken = jwt.decode(token, { complete: true });

    if (!decodedToken) {
      throw new OperationNotValidError({
        reason: 'Token is not valid.',
        token,
      });
    }

    const tokenPayload = decodedToken.payload as jwt.JwtPayload;

    if (!tokenPayload) {
      throw new OperationNotValidError({
        reason: 'Token payload is not valid.',
        token,
      });
    }

    const expiresAt = tokenPayload.exp;

    if (!expiresAt) {
      throw new OperationNotValidError({
        reason: 'Token expiration date is not set.',
        token,
      });
    }

    return { expiresAt };
  }
}
