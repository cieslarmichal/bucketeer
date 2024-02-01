import { type UserRole } from '@common/contracts';

import { type UserDomainAction } from './domainActions/userDomainAction.js';
import { UserDomainActionType } from './domainActions/userDomainActionType.js';

export interface UserDraft {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRole;
}

export interface CreateRefreshTokenPayload {
  readonly token: string;
  readonly expiresAt: Date;
}

export interface UpdateDirectoryPayload {
  readonly directoryName: string;
}

export class User {
  private id: string;
  private email: string;
  private password: string;
  private role: UserRole;

  private domainActions: UserDomainAction[] = [];

  public constructor(draft: UserDraft) {
    const { id, email, password } = draft;

    this.id = id;

    this.password = password;

    this.email = email;

    this.role = draft.role;
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getState(): UserDraft {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      role: this.role,
    };
  }

  public getDomainActions(): UserDomainAction[] {
    return this.domainActions;
  }

  public addCreateRefreshTokenAction(payload: CreateRefreshTokenPayload): void {
    const { token, expiresAt } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.createRefreshToken,
      payload: {
        token,
        expiresAt,
      },
    });
  }

  public addUpdateDirectoryAction(payload: UpdateDirectoryPayload): void {
    const { directoryName } = payload;

    this.domainActions.push({
      actionName: UserDomainActionType.updateDirectory,
      payload: {
        directoryName,
      },
    });
  }
}
