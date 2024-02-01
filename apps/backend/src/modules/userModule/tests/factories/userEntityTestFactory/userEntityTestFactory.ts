import { UserRole } from '@common/contracts';
import { Generator } from '@common/tests';

import { type UserRawEntity } from '../../../infrastructure/databases/userDatabase/tables/userTable/userRawEntity.js';

export class UserEntityTestFactory {
  public create(input: Partial<UserRawEntity> = {}): UserRawEntity {
    return {
      id: Generator.uuid(),
      email: Generator.email().toLowerCase(),
      password: Generator.password(),
      role: UserRole.user,
      ...input,
    };
  }
}
