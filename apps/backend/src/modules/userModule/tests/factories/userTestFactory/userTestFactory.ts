import { UserRole } from '@common/contracts';
import { Generator } from '@common/tests';

import { User, type UserDraft } from '../../../domain/entities/user/user.js';

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
}
