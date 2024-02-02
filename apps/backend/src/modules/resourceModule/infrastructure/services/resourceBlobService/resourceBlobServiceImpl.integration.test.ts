import path from 'path';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import { Generator } from '@common/tests';

describe('ResourcelobServiceImpl', () => {
  let container: DependencyInjectionContainer;

  const resourcesDirectory = path.resolve(__dirname, '../../../../../../../resources');

  const sampleFileName1 = 'sample_video1.mp4';

  const sampleFileName2 = 'sample_video2.mp4';

  const bucketName = 'resources1';

  beforeEach(async () => {});

  afterEach(async () => {});

  describe('download', () => {
    it('throws an error - when container does not exist', async () => {
      const nonExistingContainerName = Generator.word();

      try {
        await azureBlobService.downloadBlob({
          containerName: nonExistingContainerName,
          blobName: sampleFileName1,
        });
      } catch (error) {
        expect(error instanceof AzureBlobServiceError);

        return;
      }

      expect.fail();
    });

    it('throws an error - when blob does not exist', async () => {
      const nonExistingBlobName = Generator.word();

      try {
        await azureBlobService.downloadBlob({
          containerName: bucketName,
          blobName: nonExistingBlobName,
        });
      } catch (error) {
        expect(error instanceof AzureBlobServiceError);

        return;
      }

      expect.fail();
    });

    it('downloads a file', async () => {
      const blob = await azureBlobService.downloadBlob({
        containerName: bucketName,
        blobName: sampleFileName1,
      });

      expect(blob.name).toBe(sampleFileName1);

      expect(blob.contentSize).toEqual(17839845);

      expect(blob.contentType).toBe('application/octet-stream');

      expect(blob.data).toBeDefined();
    });
  });

  describe('blobExists', () => {
    it('returns false - when container does not exist', async () => {
      const nonExistingContainerName = Generator.word();

      const blobExists = await azureBlobService.blobExists({
        containerName: nonExistingContainerName,
        blobName: sampleFileName1,
      });

      expect(blobExists).toBe(false);
    });

    it('returns false - when blob does not exist', async () => {
      const nonExistingBlobName = Generator.word();

      const blobExists = await azureBlobService.blobExists({
        containerName: bucketName,
        blobName: nonExistingBlobName,
      });

      expect(blobExists).toBe(false);
    });

    it('returns true - when blob exists', async () => {
      const blobExists = await azureBlobService.blobExists({
        containerName: bucketName,
        blobName: sampleFileName1,
      });

      expect(blobExists).toBe(true);
    });
  });

  describe('deleteBlob', () => {
    it('throws an error - when container does not exist', async () => {
      const nonExistingContainerName = Generator.word();

      try {
        await azureBlobService.deleteBlob({
          containerName: nonExistingContainerName,
          blobName: sampleFileName1,
        });
      } catch (error) {
        expect(error instanceof AzureBlobServiceError);

        return;
      }

      expect.fail();
    });

    it('throws an error - when blob does not exist', async () => {
      const nonExistingBlobName = Generator.word();

      try {
        await azureBlobService.deleteBlob({
          containerName: bucketName,
          blobName: nonExistingBlobName,
        });
      } catch (error) {
        expect(error instanceof AzureBlobServiceError);

        return;
      }

      expect.fail();
    });

    it('deletes a blob', async () => {
      const blobName = Generator.word();

      await azuriteService.uploadBlob(bucketName, blobName, path.join(resourcesDirectory, sampleFileName1));

      const existsBefore = await azuriteService.blobExists(bucketName, blobName);

      expect(existsBefore).toBe(true);

      await azureBlobService.deleteBlob({
        containerName: bucketName,
        blobName,
      });

      const existsAfter = await azuriteService.blobExists(bucketName, blobName);

      expect(existsAfter).toBe(false);
    });
  });

  describe('getBlobsMetadata', () => {
    it('throws an error - when container does not exist', async () => {
      const nonExistingContainerName = Generator.word();

      try {
        await azureBlobService.getBlobsMetadata({
          containerName: nonExistingContainerName,
          page: 1,
          pageSize: 10,
        });
      } catch (error) {
        expect(error instanceof AzureBlobServiceError);

        return;
      }

      expect.fail();
    });

    it('returns blobs metadata with single page', async () => {
      const { items, totalPages } = await azureBlobService.getBlobsMetadata({
        containerName: bucketName,
        page: 1,
        pageSize: 10,
      });

      expect(items.length).toBe(2);

      expect(totalPages).toBe(1);

      expect(items[0]?.name).toBe(sampleFileName1);

      expect(items[1]?.name).toBe(sampleFileName2);
    });

    it('returns blobs metadata with many pages', async () => {
      const blobName1 = Generator.word();

      await azuriteService.uploadBlob(bucketName, blobName1, path.join(resourcesDirectory, sampleFileName1));

      const blobName2 = Generator.word();

      await azuriteService.uploadBlob(bucketName, blobName2, path.join(resourcesDirectory, sampleFileName1));

      const { items, totalPages } = await azureBlobService.getBlobsMetadata({
        containerName: bucketName,
        page: 1,
        pageSize: 2,
      });

      expect(items.length).toBe(2);

      expect(totalPages).toBe(2);
    });
  });

  describe('getBlobsNames', () => {
    it('throws an error - when container does not exist', async () => {
      const nonExistingContainerName = Generator.word();

      try {
        await azureBlobService.getBlobsNames({
          containerName: nonExistingContainerName,
        });
      } catch (error) {
        expect(error instanceof AzureBlobServiceError);

        return;
      }

      expect.fail();
    });

    it('returns blobs names', async () => {
      const blobsNames = await azureBlobService.getBlobsNames({
        containerName: bucketName,
      });

      expect(blobsNames.length).toBe(2);

      expect(blobsNames[0]).toBe(sampleFileName1);

      expect(blobsNames[1]).toBe(sampleFileName2);
    });
  });
});
