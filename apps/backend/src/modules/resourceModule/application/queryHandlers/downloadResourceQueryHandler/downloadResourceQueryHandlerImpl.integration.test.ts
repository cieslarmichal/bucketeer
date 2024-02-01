import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { type DownloadResourceQueryHandler } from './downloadResourceQueryHandler.js';
import { type AzuriteService } from '../../../../../../tests/azurite/azuriteService.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';

describe('FindResourcesMetadataQueryHandlerImpl', () => {
  let queryHandler: DownloadResourceQueryHandler;

  let azuriteService: AzuriteService;

  let container: DependencyInjectionContainer;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const containerName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    queryHandler = container.get<DownloadResourceQueryHandler>(symbols.downloadResourceQueryHandler);

    sqliteDatabaseClient = container.get<SqliteDatabaseClient>(coreSymbols.sqliteDatabaseClient);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    azuriteService = container.get<AzuriteService>(testSymbols.azuriteService);

    await userTestUtils.truncate();

    await azuriteService.createContainer(containerName);
  });

  afterEach(async () => {
    await userTestUtils.truncate();

    await sqliteDatabaseClient.destroy();

    await azuriteService.deleteContainer(containerName);
  });

  it('throws an error - when user does not exist', async () => {
    const userId = Generator.uuid();

    try {
      await queryHandler.execute({
        userId,
        resourceName: sampleFileName1,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when user does not have any directory', async () => {
    const user = await userTestUtils.createAndPersist();

    try {
      await queryHandler.execute({
        userId: user.id,
        resourceName: sampleFileName1,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when Resource does not exist', async () => {
    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserDirectory({
      input: {
        userId: user.id,
        directoryName: containerName,
      },
    });

    try {
      await queryHandler.execute({
        userId: user.id,
        resourceName: sampleFileName1,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('downloads a Resource', async () => {
    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserDirectory({
      input: {
        userId: user.id,
        directoryName: containerName,
      },
    });

    await azuriteService.uploadBlob(
      containerName,
      sampleFileName1,
      path.join(resourcesDirectory, sampleFileName1),
      'video/mp4',
    );

    const { resource } = await queryHandler.execute({
      userId: user.id,
      resourceName: sampleFileName1,
    });

    // TODO: validate data

    expect(resource).toEqual({
      name: sampleFileName1,
      updatedAt: expect.any(Date),
      contentSize: 17839845,
      contentType: 'video/mp4',
      data: expect.any(Object),
    });
  });
});
