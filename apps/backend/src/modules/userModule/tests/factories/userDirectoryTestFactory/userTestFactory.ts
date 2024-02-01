import { Generator } from '@common/tests';

import { UserDirectory, type UserDirectoryDraft } from '../../../domain/entities/userDirectory/userDirectory.js';

export class UserDirectoryTestFactory {
  public create(input: Partial<UserDirectoryDraft> = {}): UserDirectory {
    return new UserDirectory({
      id: Generator.uuid(),
      userId: Generator.uuid(),
      directoryName: Generator.word(),
      ...input,
    });
  }
}
