/* eslint-disable import/no-named-as-default-member */

import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
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
    const { userId, resourceId, bucketName } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName)) {
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

    this.loggerService.debug({
      message: 'Video downloaded.',
      userId,
      bucketName,
      resourceId,
      resourceName: resource.name,
    });

    const previewPath = 'preview.gif';

    this.loggerService.debug({
      message: 'Creating video preview...',
      resourceId,
      resourceName: resource.name,
      previewPath,
    });

    const videoPreview = await this.createVideoPreview(resource.data, previewPath);

    this.loggerService.debug({
      message: 'Video preview created.',
      resourceId,
      resourceName: resource.name,
      previewPath,
    });

    return {
      preview: {
        name: previewPath,
        contentType: 'video/gif',
        data: videoPreview,
      },
    };
  }

  private async createVideoPreview(videoData: Readable, previewPath: string): Promise<Readable> {
    const tmpFile = await tmp.file();

    videoData.pipe(fs.createWriteStream(tmpFile.path));

    await new Promise<void>((resolve, reject) => {
      videoData.on('end', () => {
        resolve();
      });

      videoData.on('error', (error) => {
        reject(error);
      });
    });

    const { duration } = await this.getVideoInfo(tmpFile.path);

    await new Promise(async (resolve, reject) => {
      ffmpeg()
        .setFfmpegPath(ffmpegPath as unknown as string)
        .input(tmpFile.path)
        .inputOptions('-y')
        .outputOptions('-q:v 1')
        .videoFilters(`setpts=N/TB/${duration * 10}`)
        .fps(1)
        .output(previewPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    await tmpFile.cleanup();

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
