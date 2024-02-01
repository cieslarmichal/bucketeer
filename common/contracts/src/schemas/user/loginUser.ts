export interface LoginUserBody {
  readonly email: string;
  readonly password: string;
}

export interface LoginUserResponseBody {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}
