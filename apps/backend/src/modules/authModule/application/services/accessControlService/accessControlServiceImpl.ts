import { UserRole } from '@common/contracts';

import {
  type VerifyBearerTokenPayload,
  type AccessControlService,
  type VerifyBearerTokenResult,
} from './accessControlService.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { ForbiddenAccessError } from '../../errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../../errors/unathorizedAccessError.js';
import { type TokenService } from '../tokenService/tokenService.js';

export class AccessControlServiceImpl implements AccessControlService {
  public constructor(private readonly tokenService: TokenService) {}

  public async verifyBearerToken(payload: VerifyBearerTokenPayload): Promise<VerifyBearerTokenResult> {
    const { authorizationHeader, expectedUserId, expectedRole } = payload;

    if (!authorizationHeader) {
      throw new UnauthorizedAccessError({
        securityMode: SecurityMode.bearer,
        reason: 'Authorization header not provided.',
      });
    }

    const [authorizationType, token] = authorizationHeader.split(' ');

    if (authorizationType !== 'Bearer') {
      throw new UnauthorizedAccessError({
        securityMode: SecurityMode.bearer,
        reason: 'Bearer authorization type not provided.',
      });
    }

    let tokenPayload;

    try {
      tokenPayload = this.tokenService.verifyToken({ token: token as string }) as unknown as VerifyBearerTokenResult;
    } catch (error) {
      throw new UnauthorizedAccessError({
        securityMode: SecurityMode.bearer,
        reason: 'Invalid access token.',
      });
    }

    if (tokenPayload.role === UserRole.admin) {
      return tokenPayload;
    }

    if (expectedRole && tokenPayload.role !== expectedRole) {
      throw new ForbiddenAccessError({
        reason: 'The user role is not sufficient to perform this operation.',
      });
    }

    if (expectedUserId && tokenPayload.userId !== expectedUserId) {
      throw new ForbiddenAccessError({
        reason: 'User id does not match expected user id.',
      });
    }

    return tokenPayload;
  }
}
