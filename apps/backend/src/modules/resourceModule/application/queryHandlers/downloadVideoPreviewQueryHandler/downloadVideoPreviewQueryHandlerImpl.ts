/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'node:fs';
import { type Readable } from 'node:stream';
import * as tmp from 'tmp-promise';

import { PreviewType } from '@common/contracts';

import {
  type DownloadVideoPreviewQueryHandlerPayload,
  type DownloadVideoPreviewQueryHandlerResult,
  type DownloadVideoPreviewQueryHandler,
} from './downloadVideoPreviewQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { ForbiddenAccessError } from '../../../../authModule/application/errors/forbiddenAccessError.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

interface VideoInfo {
  readonly duration: number;
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
    const { userId, resourceId, bucketName, previewType } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName)) {
      throw new ForbiddenAccessError({
        reason: 'User does not have access to this bucket.',
        userId,
        bucketName,
        userBuckets: buckets,
      });
    }

    this.loggerService.debug({
      message: 'Downloading video...',
      userId,
      bucketName,
      resourceId,
    });

    const resource = await this.resourceBlobSerice.downloadResource({
      bucketName,
      resourceId,
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

    if (!videoExtensions.some((ext) => resource.name.toLowerCase().endsWith(ext))) {
      throw new OperationNotValidError({
        reason: 'Resource is not a video.',
        userId,
        bucketName,
        resourceId,
        resourceName: resource.name,
      });
    }

    const temporaryVideoFile = await tmp.file();

    resource.data.pipe(fs.createWriteStream(temporaryVideoFile.path));

    await new Promise<void>((resolve, reject) => {
      resource.data.on('end', () => {
        resolve();
      });

      resource.data.on('error', (error) => {
        reject(error);
      });
    });

    this.loggerService.debug({
      message: 'Video downloaded.',
      userId,
      bucketName,
      resourceId,
      resourceName: resource.name,
    });

    const { duration } = await this.getVideoInfo(temporaryVideoFile.path);

    if (duration < 3) {
      throw new OperationNotValidError({
        reason: 'Video duration cannot be less than 3 seconds.',
        userId,
        bucketName,
        resourceId,
        resourceName: resource.name,
        duration,
      });
    }

    this.loggerService.debug({
      message: 'Creating video preview...',
      resourceId,
      resourceName: resource.name,
      previewType,
    });

    let videoPreviewData: Readable;

    let previewName: string;

    let contentType: string;

    if (previewType === PreviewType.static) {
      previewName = 'preview.jpg';

      contentType = 'image/jpeg';

      videoPreviewData = await this.createVideoStaticPreview(temporaryVideoFile.path, resourceId);
    } else {
      previewName = 'preview.mp4';

      contentType = 'video/mp4';

      videoPreviewData = await this.createVideoDynamicPreview(temporaryVideoFile.path, resourceId, duration);
    }

    this.loggerService.debug({
      message: 'Video preview created.',
      resourceId,
      resourceName: resource.name,
      previewType,
    });

    await temporaryVideoFile.cleanup();

    return {
      preview: {
        name: previewName,
        contentType,
        data: videoPreviewData,
      },
    };
  }

  private async createVideoStaticPreview(videoPath: string, resourceId: string): Promise<Readable> {
    const previewPath = `${resourceId}-preview.jpg`;

    await new Promise(async (resolve, reject) => {
      ffmpeg()
        .setFfmpegPath(ffmpegPath as unknown as string)
        .input(videoPath)
        .inputOptions(['-y', '-ss 00:00:01'])
        .outputOptions('-frames:v 1')
        .output(previewPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return fs.createReadStream(previewPath);
  }

  private async createVideoDynamicPreview(videoPath: string, resourceId: string, duration: number): Promise<Readable> {
    const framesPerVideo = 8;

    const frameIntervalInSeconds = Math.floor(duration / framesPerVideo);

    const framesPath = `${resourceId}-thumb%04d.jpg`;

    const previewPath = `${resourceId}-preview.mp4`;

    await new Promise(async (resolve, reject) => {
      ffmpeg()
        .setFfmpegPath(ffmpegPath as unknown as string)
        .input(videoPath)
        .inputOptions('-y')
        .outputOptions([`-vf fps=1/${frameIntervalInSeconds}`])
        .output(framesPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    await new Promise(async (resolve, reject) => {
      ffmpeg()
        .setFfmpegPath(ffmpegPath as unknown as string)
        .input(framesPath)
        .inputOptions(['-y', '-framerate 1/0.6'])
        .outputOptions([`-c:v libx264`, `-r 20`, `-pix_fmt yuv420p`])
        .output(previewPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return fs.createReadStream(previewPath);
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
