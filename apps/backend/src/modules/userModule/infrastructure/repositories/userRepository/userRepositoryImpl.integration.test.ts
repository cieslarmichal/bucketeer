import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';
import { symbols } from '../../../symbols.js';
import { UserTestFactory } from '../../../tests/factories/userTestFactory/userTestFactory.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepository;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  const userTestFactory = new UserTestFactory();

  beforeEach(async () => {
    const container = Application.createContainer();

    userRepository = container.get<UserRepository>(symbols.userRepository);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a User', async () => {
      const createdUser = userTestFactory.create();

      const { email, password, role } = createdUser.getState();

      const user = await userRepository.createUser({
        email,
        password,
        role,
      });

      const foundUser = await userTestUtils.findByEmail({ email });

      expect(user.getEmail()).toEqual(email);

      expect(foundUser.email).toEqual(email);
    });

    it('throws an error when a User with the same email already exists', async () => {
      const existingUser = await userTestUtils.createAndPersist();

      try {
        await userRepository.createUser({
          email: existingUser.email,
          password: existingUser.password,
          role: existingUser.role,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find', () => {
    it('finds a User by id', async () => {
      const user = await userTestUtils.createAndPersist();

      const foundUser = await userRepository.findUser({ id: user.id });

      expect(foundUser).not.toBeNull();
    });

    it('finds a User by email', async () => {
      const user = await userTestUtils.createAndPersist();

      const foundUser = await userRepository.findUser({ email: user.email });

      expect(foundUser).not.toBeNull();
    });

    it('returns null if a User with given id does not exist', async () => {
      const createdUser = userTestFactory.create();

      const user = await userRepository.findUser({ id: createdUser.getId() });

      expect(user).toBeNull();
    });
  });

  describe('Update', () => {
    it(`creates User's refresh tokens`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      const refreshToken1 = Generator.alphaString(32);

      const expiresAt1 = Generator.futureDate();

      const refreshToken2 = Generator.alphaString(32);

      const expiresAt2 = Generator.futureDate();

      createdUser.addCreateRefreshTokenAction({
        token: refreshToken1,
        expiresAt: expiresAt1,
      });

      createdUser.addCreateRefreshTokenAction({
        token: refreshToken2,
        expiresAt: expiresAt2,
      });

      await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      const updatedUserTokens = await userTestUtils.findTokensByUserId({ userId: user.id });

      expect(updatedUserTokens.refreshTokens.includes(refreshToken1)).toBe(true);

      expect(updatedUserTokens.refreshTokens.includes(refreshToken2)).toBe(true);
    });

    it(`add User's bucket`, async () => {
      const user = await userTestUtils.createAndPersist();

      const createdUser = userTestFactory.create();

      const bucketName = Generator.word();

      createdUser.addGrantBucketAccessAction({ bucketName });

      await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      const buckets = await userTestUtils.findBucketsByUserId({ userId: user.id });

      expect(buckets.length).toEqual(1);

      expect(buckets[0]?.bucketName).toEqual(bucketName);
    });

    it(`removes User's bucket`, async () => {
      const user = await userTestUtils.createAndPersist();

      const { bucketName } = await userTestUtils.createAndPersistUserBucket({ input: { userId: user.id } });

      const createdUser = userTestFactory.create();

      createdUser.addRevokeBucketAccessAction({ bucketName });

      await userRepository.updateUser({
        id: user.id,
        domainActions: createdUser.getDomainActions(),
      });

      const buckets = await userTestUtils.findBucketsByUserId({ userId: user.id });

      expect(buckets.length).toEqual(0);
    });

    it('throws an error if a User with given id does not exist', async () => {
      const nonExistentUser = userTestFactory.create();

      try {
        await userRepository.updateUser({
          id: nonExistentUser.getId(),
          domainActions: nonExistentUser.getDomainActions(),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });

  describe('Delete', () => {
    it('deletes a User', async () => {
      const user = await userTestUtils.createAndPersist();

      await userRepository.deleteUser({ id: user.id });

      const foundUser = await userTestUtils.findById({ id: user.id });

      expect(foundUser).toBeUndefined();
    });

    it('throws an error if a User with given id does not exist', async () => {
      const nonExistentUser = userTestFactory.create();

      try {
        await userRepository.deleteUser({ id: nonExistentUser.getId() });
      } catch (error) {
        expect(error).toBeInstanceOf(ResourceNotFoundError);

        return;
      }

      expect.fail();
    });
  });

  describe('Find tokens', () => {
    it('finds User tokens by userId', async () => {
      const user = await userTestUtils.createAndPersist();

      const refreshToken1 = Generator.alphaString(32);

      const expiresAt1 = Generator.futureDate();

      const refreshToken2 = Generator.alphaString(32);

      const expiresAt2 = Generator.futureDate();

      await userTestUtils.createAndPersistRefreshToken({
        input: {
          userId: user.id,
          token: refreshToken1,
          expiresAt: expiresAt1,
        },
      });

      await userTestUtils.createAndPersistRefreshToken({
        input: {
          userId: user.id,
          token: refreshToken2,
          expiresAt: expiresAt2,
        },
      });

      const userTokens = await userRepository.findUserTokens({ userId: user.id });

      expect(userTokens).not.toBeNull();

      expect(userTokens!.refreshTokens.includes(refreshToken1)).toBe(true);

      expect(userTokens!.refreshTokens.includes(refreshToken2)).toBe(true);
    });

    it('returns null if a User with given id does not exist', async () => {
      const nonExistentUser = userTestFactory.create();

      const userTokens = await userRepository.findUserTokens({ userId: nonExistentUser.getId() });

      expect(userTokens).toBeNull();
    });
  });

  describe('Find buckets', () => {
    it('finds User buckets', async () => {
      const user = await userTestUtils.createAndPersist();

      const bucketName1 = 'bucket1';

      const bucketName2 = 'bucket2';

      await userTestUtils.createAndPersistUserBucket({
        input: {
          userId: user.id,
          bucketName: bucketName1,
        },
      });

      await userTestUtils.createAndPersistUserBucket({
        input: {
          userId: user.id,
          bucketName: bucketName2,
        },
      });

      const buckets = await userRepository.findUserBuckets({ userId: user.id });

      expect(buckets.length).toEqual(2);

      expect(buckets.find((bucket) => bucket.getBucketName() === bucketName1)).not.toBeNull();

      expect(buckets.find((bucket) => bucket.getBucketName() === bucketName2)).not.toBeNull();
    });

    it('returns empty array if a User with given id does not exist', async () => {
      const nonExistentUser = userTestFactory.create();

      const buckets = await userRepository.findUserBuckets({ userId: nonExistentUser.getId() });

      expect(buckets.length).toEqual(0);
    });
  });
});
