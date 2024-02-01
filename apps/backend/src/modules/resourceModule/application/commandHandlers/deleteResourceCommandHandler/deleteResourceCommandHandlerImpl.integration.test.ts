import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { type DeleteResourceCommandHandler } from './deleteResourceCommandHandler.js';
import { type AzuriteService } from '../../../../../../tests/azurite/azuriteService.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type SqliteDatabaseClient } from '../../../../../core/database/sqliteDatabaseClient/sqliteDatabaseClient.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { symbols } from '../../../symbols.js';

describe('DeleteResourceCommandHandlerImpl', () => {
  let commandHandler: DeleteResourceCommandHandler;

  let azuriteService: AzuriteService;

  let container: DependencyInjectionContainer;

  let sqliteDatabaseClient: SqliteDatabaseClient;

  let userTestUtils: UserTestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName = 'sample_video1.mp4';

  const containerName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    commandHandler = container.get<DeleteResourceCommandHandler>(symbols.deleteResourceCommandHandler);

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
      await commandHandler.execute({
        userId,
        resourceName: sampleFileName,
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
      await commandHandler.execute({
        userId: user.id,
        resourceName: sampleFileName,
      });
    } catch (error) {
      expect(error instanceof ResourceNotFoundError);

      return;
    }

    expect.fail();
  });

  it('throws an error - when resource does not exist', async () => {
    const nonExistingResourceName = Generator.word();

    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserDirectory({
      input: {
        userId: user.id,
      },
    });

    try {
      await commandHandler.execute({
        userId: user.id,
        resourceName: nonExistingResourceName,
      });
    } catch (error) {
      expect(error instanceof OperationNotValidError);

      return;
    }

    expect.fail();
  });

  it('deletes a resource', async () => {
    const user = await userTestUtils.createAndPersist();

    await userTestUtils.createAndPersistUserDirectory({
      input: {
        userId: user.id,
        directoryName: containerName,
      },
    });

    await azuriteService.uploadBlob(containerName, sampleFileName, path.join(resourcesDirectory, sampleFileName));

    const existsBefore = await azuriteService.blobExists(containerName, sampleFileName);

    expect(existsBefore).toBe(true);

    await commandHandler.execute({
      userId: user.id,
      resourceName: sampleFileName,
    });

    const existsAfter = await azuriteService.blobExists(containerName, sampleFileName);

    expect(existsAfter).toBe(false);
  });
});
