export interface UserBucketDraft {
  readonly id: string;
  readonly userId: string;
  readonly bucketName: string;
}

export class UserBucket {
  private readonly id: string;
  private readonly userId: string;
  private readonly bucketName: string;

  public constructor(draft: UserBucketDraft) {
    const { id, userId, bucketName } = draft;

    this.id = id;

    this.bucketName = bucketName;

    this.userId = userId;
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getBucketName(): string {
    return this.bucketName;
  }
}
