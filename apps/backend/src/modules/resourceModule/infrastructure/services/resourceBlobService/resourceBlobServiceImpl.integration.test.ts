import { createReadStream } from 'node:fs';
import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { type DependencyInjectionContainer } from '../../../../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';
import { symbols } from '../../../symbols.js';
import { type S3TestUtils } from '../../../tests/utils/s3TestUtils.js';

describe('ResourceBlobServiceImpl', () => {
  let container: DependencyInjectionContainer;

  let resourceBlobService: ResourceBlobService;

  let s3TestUtils: S3TestUtils;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const sampleFileName2 = 'sample_video2.mp4';

  const bucketName = 'resources';

  beforeEach(async () => {
    container = TestContainer.create();

    resourceBlobService = container.get<ResourceBlobService>(symbols.resourceBlobService);

    s3TestUtils = container.get<S3TestUtils>(testSymbols.s3TestUtils);

    await s3TestUtils.createBucket(bucketName);
  });

  afterEach(async () => {
    await s3TestUtils.deleteBucket(bucketName);
  });

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
      await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

      const resource = await resourceBlobService.downloadResource({
        bucketName,
        resourceName: sampleFileName1,
      });

      expect(resource.name).toBe(sampleFileName1);

      expect(resource.contentSize).toEqual(17839845);

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
      await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

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
      await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

      const existsBefore = await s3TestUtils.objectExists(bucketName, sampleFileName1);

      expect(existsBefore).toBe(true);

      await resourceBlobService.deleteResource({
        bucketName,
        resourceName: sampleFileName1,
      });

      const existsAfter = await s3TestUtils.objectExists(bucketName, sampleFileName1);

      expect(existsAfter).toBe(false);
    });
  });

  describe('getMetadata', () => {
    it('throws an error - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.getResourcesMetadata({
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
      await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

      await s3TestUtils.uploadObject(bucketName, sampleFileName2, path.join(resourcesDirectory, sampleFileName2));

      const { items, totalPages } = await resourceBlobService.getResourcesMetadata({
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

      const resourceName2 = Generator.word();

      const resourceName3 = Generator.word();

      const resourceName4 = Generator.word();

      await s3TestUtils.uploadObject(bucketName, resourceName1, path.join(resourcesDirectory, sampleFileName1));

      await s3TestUtils.uploadObject(bucketName, resourceName2, path.join(resourcesDirectory, sampleFileName2));

      await s3TestUtils.uploadObject(bucketName, resourceName3, path.join(resourcesDirectory, sampleFileName2));

      await s3TestUtils.uploadObject(bucketName, resourceName4, path.join(resourcesDirectory, sampleFileName2));

      const { items: items1, totalPages: totalPages1 } = await resourceBlobService.getResourcesMetadata({
        bucketName,
        page: 1,
        pageSize: 2,
      });

      expect(items1.length).toBe(2);

      expect(totalPages1).toBe(2);

      const { items: items2, totalPages: totalPages2 } = await resourceBlobService.getResourcesMetadata({
        bucketName,
        page: 2,
        pageSize: 2,
      });

      expect(items2.length).toBe(2);

      expect(totalPages2).toBe(2);

      const uniqueItems = [...new Set([...items1, ...items2].map((item) => item.name))];

      expect(uniqueItems.length).toBe(4);

      const { items: items3, totalPages: totalPages3 } = await resourceBlobService.getResourcesMetadata({
        bucketName,
        page: 3,
        pageSize: 2,
      });

      expect(items3.length).toBe(0);

      expect(totalPages3).toBe(2);
    });
  });

  describe('getNames', () => {
    it('throws an error - when bucket does not exist', async () => {
      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.getResourcesNames({
          bucketName: nonExistingBucketName,
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('returns resources names', async () => {
      await s3TestUtils.uploadObject(bucketName, sampleFileName1, path.join(resourcesDirectory, sampleFileName1));

      await s3TestUtils.uploadObject(bucketName, sampleFileName2, path.join(resourcesDirectory, sampleFileName2));

      const resourcesNames = await resourceBlobService.getResourcesNames({
        bucketName,
      });

      expect(resourcesNames.length).toBe(2);

      expect(resourcesNames[0]).toBe(sampleFileName1);

      expect(resourcesNames[1]).toBe(sampleFileName2);
    });
  });

  describe('upload', () => {
    it('throws an error - when object already exists', async () => {
      const filePath = path.join(resourcesDirectory, sampleFileName1);

      await s3TestUtils.uploadObject(bucketName, sampleFileName1, filePath);

      try {
        await resourceBlobService.uploadResource({
          bucketName,
          resourceName: sampleFileName1,
          data: createReadStream(filePath),
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('throws an error - when bucket does not exist', async () => {
      const filePath = path.join(resourcesDirectory, sampleFileName1);

      const nonExistingBucketName = Generator.word();

      try {
        await resourceBlobService.uploadResource({
          bucketName: nonExistingBucketName,
          resourceName: sampleFileName1,
          data: createReadStream(filePath),
        });
      } catch (error) {
        expect(error).toBeDefined();

        return;
      }

      expect.fail();
    });

    it('uploads a resource', async () => {
      const filePath = path.join(resourcesDirectory, sampleFileName1);

      await resourceBlobService.uploadResource({
        bucketName,
        resourceName: sampleFileName1,
        data: createReadStream(filePath),
      });

      const exists = await s3TestUtils.objectExists(bucketName, sampleFileName1);

      expect(exists).toBe(true);
    });
  });
});
