import { type UserRole } from '@common/contracts';

export interface UserDraft {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
}

export interface UserState {
  email: string;
  password: string;
  role: UserRole;
}

export interface GrantBucketAccessPayload {
  readonly bucketName: string;
}

export interface RevokeBucketAccessPayload {
  readonly bucketName: string;
}

export class User {
  private id: string;
  private state: UserState;

  public constructor(draft: UserDraft) {
    this.id = draft.id;

    this.state = {
      email: draft.email,
      password: draft.password,
      role: draft.role,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.state.email;
  }

  public getPassword(): string {
    return this.state.password;
  }

  public getRole(): UserRole {
    return this.state.role;
  }

  public getState(): UserState {
    return this.state;
  }
}
