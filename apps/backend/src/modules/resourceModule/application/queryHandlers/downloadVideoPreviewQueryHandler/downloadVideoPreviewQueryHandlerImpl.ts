/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs';
import { type Readable } from 'node:stream';
import * as tmp from 'tmp-promise';

import {
  type DownloadVideoPreviewQueryHandlerPayload,
  type DownloadVideoPreviewQueryHandlerResult,
  type DownloadVideoPreviewQueryHandler,
} from './downloadVideoPreviewQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

interface VideoInfo {
  readonly size: number;
  readonly durationInSeconds: number;
}

export class DownloadVideoPreviewQueryHandlerImpl implements DownloadVideoPreviewQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(
    payload: DownloadVideoPreviewQueryHandlerPayload,
  ): Promise<DownloadVideoPreviewQueryHandlerResult> {
    const { userId, resourceName, bucketName } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Downloading video...',
      userId,
      bucketName,
      resourceName,
    });

    const resource = await this.resourceBlobSerice.downloadResource({
      bucketName,
      resourceName,
    });

    const videoExtensions: string[] = [
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

    if (!videoExtensions.some((ext) => resourceName.toLowerCase().endsWith(ext))) {
      throw new OperationNotValidError({
        reason: 'Resource is not a video.',
        userId,
        bucketName,
        resourceName,
      });
    }

    this.loggerService.debug({
      message: 'Video downloaded.',
      userId,
      bucketName,
      resourceName,
    });

    const previewPath = 'preview.mp4';

    this.loggerService.debug({
      message: 'Creating video preview...',
      resourceName,
      previewPath,
    });

    const videoPreview = await this.createVideoPreview(resource.data, previewPath);

    this.loggerService.debug({
      message: 'Video preview created.',
      resourceName,
      previewPath,
    });

    return {
      resource: {
        name: resource.name,
        updatedAt: resource.updatedAt,
        contentType: resource.contentType,
        contentSize: resource.contentSize,
        data: videoPreview,
      },
    };
  }

  private async createVideoPreview(videoData: Readable, previewPath: string): Promise<Readable> {
    await new Promise(async (resolve, reject) => {
      const { durationInSeconds } = await this.getVideoInfo(videoData);

      const frameIntervalInSeconds = Math.floor(durationInSeconds / 10);

      ffmpeg()
        .input(videoData)
        .outputOptions([`-vf fps=1/${frameIntervalInSeconds}`])
        .output('thumb%04d.jpg')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    await new Promise(async (resolve, reject) => {
      ffmpeg()
        .inputOptions(['-framerate 1/0.6'])
        .input('thumb%04d.jpg')
        .output(previewPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return fs.createReadStream(previewPath);
  }

  private async getVideoInfo(videoData: Readable): Promise<VideoInfo> {
    ffmpeg().setFfprobePath(ffmpegPath.default as string);

    const tmpFile = await tmp.file();

    videoData.pipe(fs.createWriteStream(tmpFile.path));

    return new Promise((resolve, reject) => {
      videoData.on('end', () => {
        ffmpeg.ffprobe(tmpFile.path, (error, videoInfo) => {
          tmpFile.cleanup();

          if (error) {
            return reject(error);
          }

          const { duration, size } = videoInfo.format;

          return resolve({
            size: Number(size),
            durationInSeconds: Math.floor(Number(duration)),
          });
        });
      });
    });
  }
}
