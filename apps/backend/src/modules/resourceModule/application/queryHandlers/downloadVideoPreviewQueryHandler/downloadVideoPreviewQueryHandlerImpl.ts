import pathToFfmpeg from 'ffmpeg-static';
import ffmpeg, { ffprobe } from 'fluent-ffmpeg';

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
    const { userId, resourceName, bucketName, width, height } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Downloading Video preview...',
      userId,
      bucketName,
      resourceName,
      width,
      height,
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

    ffmpeg()
      .setFfmpegPath(pathToFfmpeg.default as string)
      .input(resource.data)
      .outputOptions([`-vf scale=${width}:${height}`, '-vframes 1']);

    const resizedImageData = resource.data.pipe(resizing);

    this.loggerService.debug({
      message: 'Video preview downloaded.',
      userId,
      bucketName,
      resourceName,
      width,
      height,
    });

    return {
      resource: {
        name: resource.name,
        updatedAt: resource.updatedAt,
        contentType: resource.contentType,
        contentSize: resource.contentSize,
        data: resizedImageData,
      },
    };
  }

  private getVideoInfo(inputPath: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      return ffprobe(inputPath, (error, videoInfo) => {
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
  }
}
