import { type UserRole } from '@common/contracts';

export interface VerifyBearerTokenPayload {
  readonly authorizationHeader: string | undefined;
  readonly expectedUserId?: string;
  readonly expectedRole?: UserRole;
}

export interface VerifyBearerTokenResult {
  readonly userId: string;
  readonly role: UserRole;
}

export interface AccessControlService {
  verifyBearerToken(payload: VerifyBearerTokenPayload): Promise<VerifyBearerTokenResult>;
}
