export interface BlacklistTokenDraft {
  readonly id: string;
  readonly token: string;
  readonly expiresAt: Date;
}

export class BlacklistToken {
  private readonly id: string;
  private readonly token: string;
  private readonly expiresAt: Date;

  public constructor(draft: BlacklistTokenDraft) {
    const { id, token, expiresAt } = draft;

    this.id = id;

    this.token = token;

    this.expiresAt = expiresAt;
  }

  public getId(): string {
    return this.id;
  }

  public getToken(): string {
    return this.token;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }
}
