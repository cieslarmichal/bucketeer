export interface UserDirectoryDraft {
  readonly id: string;
  readonly userId: string;
  readonly directoryName: string;
}

export class UserDirectory {
  private readonly id: string;
  private readonly userId: string;
  private readonly directoryName: string;

  public constructor(draft: UserDirectoryDraft) {
    const { id, userId, directoryName } = draft;

    this.id = id;

    this.directoryName = directoryName;

    this.userId = userId;
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getDirectoryName(): string {
    return this.directoryName;
  }
}
