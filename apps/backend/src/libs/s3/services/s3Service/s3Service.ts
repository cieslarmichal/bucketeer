import { type Readable } from 'node:stream';

export interface PutObjectPayload {
  readonly bucket: string;
  readonly objectKey: string;
  readonly data: Readable;
}

export interface GetObjectDataPayload {
  readonly bucket: string;
  readonly objectKey: string;
}

export interface DeleteObjectPayload {
  readonly bucket: string;
  readonly objectKey: string;
}

export interface GetObjectsKeysPayload {
  readonly bucket: string;
}

export interface CheckIfObjectExistsPayload {
  readonly bucket: string;
  readonly objectKey: string;
}

export interface S3Service {
  putObject(payload: PutObjectPayload): Promise<void>;
  getObjectData(payload: GetObjectDataPayload): Promise<Readable | undefined>;
  deleteObject(payload: DeleteObjectPayload): Promise<void>;
  getObjectsKeys(payload: GetObjectsKeysPayload): Promise<string[]>;
  checkIfObjectExists(payload: CheckIfObjectExistsPayload): Promise<boolean>;
}
