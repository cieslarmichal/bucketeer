import { expect, describe, it } from 'vitest';

import { UserMapperImpl } from './userMapperImpl.js';
import { UserEntityTestFactory } from '../../../../tests/factories/userEntityTestFactory/userEntityTestFactory.js';

describe('UserMapperImpl', () => {
  const userMapperImpl = new UserMapperImpl();

  const userEntityTestFactory = new UserEntityTestFactory();

  it('maps from UserRawEntity to User', async () => {
    const userEntity = userEntityTestFactory.create();

    const user = userMapperImpl.mapToDomain(userEntity);

    expect(user).toEqual({
      id: userEntity.id,
      email: userEntity.email,
      password: userEntity.password,
      role: userEntity.role,
      domainActions: [],
    });
  });
});
