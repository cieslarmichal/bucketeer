/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import mime from 'mime';
import { createReadStream } from 'node:fs';
import { type Readable } from 'node:stream';
import sharp from 'sharp';

import {
  type UploadResourcesCommandHandler,
  type UploadResourcesCommandHandlerPayload,
} from './uploadResourcesCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

interface VideoInfo {
  readonly duration: number;
}

export class UploadResourcesCommandHandlerImpl implements UploadResourcesCommandHandler {
  private readonly imagesExtensions = ['jpg', 'jpeg', 'tiff', 'webp', 'raw', 'png'];

  private readonly videosExtensions = [
    '.mp4',
    '.mov',
    '.avi',
    '.mkv',
    '.wmv',
    '.flv',
    '.webm',
    '.mpeg',
    '.mpg',
    '.3gp',
    '.ogg',
    '.ts',
    '.m4v',
    '.m2ts',
    '.vob',
    '.rm',
    '.rmvb',
    '.divx',
    '.asf',
    '.swf',
    '.f4v',
  ];

  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
    private readonly uuidService: UuidService,
  ) {}

  public async execute(payload: UploadResourcesCommandHandlerPayload): Promise<void> {
    const { userId, bucketName, files } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket is not assigned to this user.',
        userId,
        bucketName,
      });
    }

    const bucketPreviewsName = `${bucketName}-previews`;

    await Promise.all(
      files.map(async (file) => {
        const { name: resourceName, filePath } = file;

        const contentType = mime.getType(resourceName);

        if (!contentType) {
          throw new OperationNotValidError({
            reason: 'Content type not found',
            resourceName,
          });
        }

        const resourceId = this.uuidService.generateUuid();

        this.loggerService.debug({
          message: 'Uploading Resource...',
          userId,
          bucketName,
          resourceName,
          contentType,
          resourceId,
        });

        const data = createReadStream(filePath);

        const isImage = this.imagesExtensions.some((extension) => resourceName.toLowerCase().endsWith(extension));

        const isVideo = this.videosExtensions.some((extension) => resourceName.toLowerCase().endsWith(extension));

        if (isImage) {
          const imagePreviewStream = data.pipe(
            sharp()
              .resize(320, 240, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .toFormat('jpeg', { quality: 80 }),
          );

          await Promise.all([
            this.resourceBlobSerice.uploadResource({
              resourceId,
              bucketName: bucketPreviewsName,
              resourceName: resourceName.replace(/\.[^/.]+$/, '-preview.jpeg'),
              data: imagePreviewStream,
              contentType: 'image/jpeg',
            }),
            this.resourceBlobSerice.uploadResource({
              resourceId,
              bucketName,
              resourceName,
              data,
              contentType,
            }),
          ]);
        } else if (isVideo) {
          const videoPreviewStream = await this.createVideoPreview(filePath, resourceName);

          await Promise.all([
            this.resourceBlobSerice.uploadResource({
              resourceId,
              bucketName: bucketPreviewsName,
              resourceName: resourceName.replace(/\.[^/.]+$/, '-preview.mp4'),
              data: videoPreviewStream,
              contentType: 'video/mp4',
            }),
            this.resourceBlobSerice.uploadResource({
              resourceId,
              bucketName,
              resourceName,
              data,
              contentType,
            }),
          ]);
        } else {
          throw new OperationNotValidError({
            reason: 'File type not supported.',
            resourceName,
            supportedExtensions: [...this.imagesExtensions, ...this.videosExtensions],
          });
        }

        this.loggerService.debug({
          message: 'Resource uploaded.',
          userId,
          bucketName,
          resourceName,
          contentType,
          resourceId,
        });
      }),
    );
  }

  private async createVideoPreview(videoPath: string, resourceName: string): Promise<Readable> {
    const previewPath = resourceName.replace(/\.[^/.]+$/, '-preview.mp4');

    const { duration } = await this.getVideoInfo(videoPath);

    const previewDuration = Math.min(duration, 3);

    await new Promise(async (resolve, reject) => {
      ffmpeg()
        .setFfmpegPath(ffmpegPath as unknown as string)
        .input(videoPath)
        .outputOptions(['-y', '-ss 00:00:00', `-t ${previewDuration}`, '-an', '-vf', 'scale=320:240'])
        .output(previewPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return createReadStream(previewPath);
  }

  private async getVideoInfo(videoPath: string): Promise<VideoInfo> {
    ffmpeg().setFfprobePath(ffprobePath.path);

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error, videoInfo) => {
        if (error) {
          return reject(error);
        }

        const { duration } = videoInfo.format;

        return resolve({
          duration: Math.floor(Number(duration)),
        });
      });
    });
  }
}
