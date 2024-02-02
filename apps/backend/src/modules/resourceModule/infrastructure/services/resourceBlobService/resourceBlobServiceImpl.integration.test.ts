import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';
import { symbols } from '../../../symbols.js';

describe('ResourceBlobServiceImpl', () => {
  let container: DependencyInjectionContainer;

  let resourceBlobService: ResourceBlobService;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const sampleFileName2 = 'sample_video2.mp4';

  const bucketName = 'resources1';

  beforeEach(async () => {
    container = TestContainer.create();

    resourceBlobService = container.get<ResourceBlobService>(symbols.resourceBlobService);

    await azuriteService.createContainer(containerName);
  });

  afterEach(async () => {});

  describe('download', () => {
    it('throws an error - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.downloadResource({
          bucketName: nonExistingBucketName,
          resourceName: sampleFileName1,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('throws an error - when resource does not exist', async () => {
      const nonExistingResourceName = Generator.word();

      try {
        await resourceBlobService.downloadResource({
          bucketName,
          resourceName: nonExistingResourceName,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('downloads a file', async () => {
      const resource = await resourceBlobService.downloadResource({
        bucketName,
        resourceName: sampleFileName1,
      });

      expect(resource.name).toBe(sampleFileName1);

      expect(resource.contentSize).toEqual(17839845);

      expect(resource.contentType).toBe('application/octet-stream');

      expect(resource.data).toBeDefined();
    });
  });

  describe('exists', () => {
    it('returns false - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      const resourceExists = await resourceBlobService.resourceExists({
        bucketName: nonExistingBucketName,
        resourceName: sampleFileName1,
      });

      expect(resourceExists).toBe(false);
    });

    it('returns false - when resource does not exist', async () => {
      const nonExistingResourceName = Generator.word();

      const resourceExists = await resourceBlobService.resourceExists({
        bucketName,
        resourceName: nonExistingResourceName,
      });

      expect(resourceExists).toBe(false);
    });

    it('returns true - when resource exists', async () => {
      const resourceExists = await resourceBlobService.resourceExists({
        bucketName,
        resourceName: sampleFileName1,
      });

      expect(resourceExists).toBe(true);
    });
  });

  describe('delete', () => {
    it('throws an error - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.deleteResource({
          bucketName: nonExistingBucketName,
          resourceName: sampleFileName1,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('throws an error - when resource does not exist', async () => {
      const nonExistingResourceName = Generator.word();

      try {
        await resourceBlobService.deleteResource({
          bucketName,
          resourceName: nonExistingResourceName,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('deletes a resource', async () => {
      const resourceName = Generator.word();

      await azuriteService.uploadBlob(bucketName, resourceName, path.join(resourcesDirectory, sampleFileName1));

      const existsBefore = await azuriteService.resourceExists(bucketName, resourceName);

      expect(existsBefore).toBe(true);

      await resourceBlobService.deleteBlob({
        bucketName,
        resourceName,
      });

      const existsAfter = await azuriteService.resourceExists(bucketName, resourceName);

      expect(existsAfter).toBe(false);
    });
  });

  describe('getBlobsMetadata', () => {
    it('throws an error - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.getBlobsMetadata({
          bucketName: nonExistingBucketName,
          page: 1,
          pageSize: 10,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('returns resources metadata with single page', async () => {
      const { items, totalPages } = await resourceBlobService.getBlobsMetadata({
        bucketName,
        page: 1,
        pageSize: 10,
      });

      expect(items.length).toBe(2);

      expect(totalPages).toBe(1);

      expect(items[0]?.name).toBe(sampleFileName1);

      expect(items[1]?.name).toBe(sampleFileName2);
    });

    it('returns resources metadata with many pages', async () => {
      const resourceName1 = Generator.word();

      await azuriteService.uploadBlob(bucketName, resourceName1, path.join(resourcesDirectory, sampleFileName1));

      const resourceName2 = Generator.word();

      await azuriteService.uploadBlob(bucketName, resourceName2, path.join(resourcesDirectory, sampleFileName1));

      const { items, totalPages } = await resourceBlobService.getBlobsMetadata({
        bucketName,
        page: 1,
        pageSize: 2,
      });

      expect(items.length).toBe(2);

      expect(totalPages).toBe(2);
    });
  });

  describe('getBlobsNames', () => {
    it('throws an error - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.getBlobsNames({
          bucketName: nonExistingBucketName,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('returns resources names', async () => {
      const resourcesNames = await resourceBlobService.getBlobsNames({
        bucketName,
      });

      expect(resourcesNames.length).toBe(2);

      expect(resourcesNames[0]).toBe(sampleFileName1);

      expect(resourcesNames[1]).toBe(sampleFileName2);
    });
  });
});
