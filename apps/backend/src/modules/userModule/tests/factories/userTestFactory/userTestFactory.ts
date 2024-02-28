import { UserRole } from '@common/contracts';
import { Generator } from '@common/tests';

import { User, type UserDraft } from '../../../domain/entities/user/user.js';
import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';

export class UserTestFactory {
  public create(input: Partial<UserDraft> = {}): User {
    return new User({
      id: Generator.uuid(),
      email: Generator.email().toLowerCase(),
      password: Generator.password(),
      role: UserRole.user,
      ...input,
    });
  }

  public createRaw(input: Partial<UserRawEntity> = {}): UserRawEntity {
    return {
      id: Generator.uuid(),
      email: Generator.email().toLowerCase(),
      password: Generator.password(),
      role: UserRole.user,
      ...input,
    };
  }
}
