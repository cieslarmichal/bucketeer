export interface CreateTokenPayload {
  readonly data: Record<string, string>;
  readonly expiresIn: number;
}

export interface VerifyTokenPayload {
  readonly token: string;
}

export interface DecodeTokenPayload {
  readonly token: string;
}

export interface DecodeTokenResult {
  readonly expiresAt: number;
}

export interface TokenService {
  createToken(payload: CreateTokenPayload): string;
  verifyToken(payload: VerifyTokenPayload): Record<string, string>;
  decodeToken(payload: DecodeTokenPayload): DecodeTokenResult;
}
