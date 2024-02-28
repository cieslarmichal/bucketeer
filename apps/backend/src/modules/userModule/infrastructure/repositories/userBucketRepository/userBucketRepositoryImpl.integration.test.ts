import { beforeEach, afterEach, expect, describe, it } from 'vitest';

import { Generator } from '@common/tests';

import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { Application } from '../../../../../core/application.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type UserBucketRepository } from '../../../domain/repositories/userBucketRepository/userBucketRepository.js';
import { symbols } from '../../../symbols.js';
import { UserBucketTestUtils } from '../../../tests/utils/userBucketTestUtils/userBucketTestUtils.js';
import { UserTestUtils } from '../../../tests/utils/userTestUtils/userTestUtils.js';

describe('UserBucketRepositoryImpl', () => {
  let userBucketRepository: UserBucketRepository;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  let userBucketTestUtils: UserBucketTestUtils;

  beforeEach(async () => {
    const container = Application.createContainer();

    userBucketRepository = container.get<UserBucketRepository>(symbols.userBucketRepository);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = new UserTestUtils(sqliteDatabaseClient);

    userBucketTestUtils = new UserBucketTestUtils(sqliteDatabaseClient);

    await userTestUtils.truncate();

    await userBucketTestUtils.truncate();
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await userBucketTestUtils.truncate();

    await sqliteDatabaseClient.destroy();
  });

  describe('Create', () => {
    it('creates a UserBucket', async () => {
      const user = await userTestUtils.createAndPersist();

      const bucketName = Generator.word();

      const userBucket = await userBucketRepository.createUserBucket({
        userId: user.id,
        bucketName,
      });

      const foundUserBucket = await userBucketTestUtils.findUserBucket({ bucketName });

      expect(userBucket.getBucketName()).toEqual(bucketName);

      expect(foundUserBucket.bucketName).toEqual(bucketName);
    });

    it('throws an error when a UserBucket with the same bucket name already exists', async () => {
      const user = await userTestUtils.createAndPersist();

      const existingUserBucket = await userBucketTestUtils.createAndPersist({ input: { userId: user.id } });

      try {
        await userBucketRepository.createUserBucket({
          userId: user.id,
          bucketName: existingUserBucket.bucketName,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        return;
      }

      expect.fail();
    });
  });

  describe('Delete', () => {
    it('deletes a UserBucket', async () => {
      const user = await userTestUtils.createAndPersist();

      const existingUserBucket = await userBucketTestUtils.createAndPersist({ input: { userId: user.id } });

      await userBucketRepository.deleteUserBucket({ bucketName: existingUserBucket.bucketName });

      const foundUserBucket = await userBucketTestUtils.findUserBucket({ bucketName: existingUserBucket.bucketName });

      expect(foundUserBucket).toBeUndefined();
    });
  });

  describe('Find', () => {
    it('finds UserBuckets', async () => {
      const user = await userTestUtils.createAndPersist();

      const existingUserBucket = await userBucketTestUtils.createAndPersist({ input: { userId: user.id } });

      const userBuckets = await userBucketRepository.findUserBuckets({ userId: user.id });

      expect(userBuckets.length).toEqual(1);

      expect(userBuckets[0]?.getBucketName()).toEqual(existingUserBucket.bucketName);
    });
  });
});
