import Cookie from 'js-cookie';

interface SetUserTokensCookiePayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class CookieService {
  private static userTokensCookieName = 'bucketeer-user-tokens-cookie';

  private static userDataCookieName = 'bucketeer-user-data-cookie';

  public static getUserTokensCookie(): string | undefined {
    return Cookie.get(this.userTokensCookieName);
  }

  public static setUserDataCookie(userData: string): void {
    Cookie.set(this.userDataCookieName, userData, {
      secure: true,
      sameSite: 'strict',
    });
  }

  public static getUserDataCookie(): string | undefined {
    return Cookie.get(this.userDataCookieName);
  }

  public static setUserTokensCookie(payload: SetUserTokensCookiePayload): void {
    const { accessToken, expiresIn, refreshToken } = payload;

    Cookie.set(
      this.userTokensCookieName,
      JSON.stringify({
        accessToken,
        refreshToken,
      }),
      {
        secure: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + expiresIn * 1000),
      },
    );
  }

  public static removeUserDataCookie(): void {
    Cookie.remove(this.userDataCookieName);
  }

  public static removeUserTokensCookie(): void {
    Cookie.remove(this.userTokensCookieName);
  }
}
