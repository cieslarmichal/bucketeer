import { type Static, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { TransformDecodeCheckError } from '@sinclair/typebox/value/transform';
import config from 'config';

import { ConfigurationError } from '../common/errors/common/configurationError.js';
import { AwsRegion } from '../common/types/awsRegion.js';
import { LogLevel } from '../libs/logger/types/logLevel.js';

const configSchema = Type.Object({
  server: Type.Object({
    host: Type.String({ minLength: 1 }),
    port: Type.Number({
      minimum: 1,
      maximum: 65535,
    }),
  }),
  admin: Type.Object({
    email: Type.String({ minLength: 1 }),
    password: Type.String({ minLength: 1 }),
  }),
  logLevel: Type.Enum(LogLevel),
  databasePath: Type.String({ minLength: 1 }),
  hashSaltRounds: Type.Number({
    minimum: 5,
    maximum: 15,
  }),
  token: Type.Object({
    secret: Type.String({ minLength: 1 }),
    access: Type.Object({
      expiresIn: Type.Number({ minimum: 3600 }),
    }),
    refresh: Type.Object({
      expiresIn: Type.Number({ minimum: 3600 }),
    }),
  }),
  aws: Type.Object({
    accessKeyId: Type.String({ minLength: 1 }),
    secretAccessKey: Type.String({ minLength: 1 }),
    region: Type.Enum(AwsRegion),
    endpoint: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  }),
});

export type Config = Static<typeof configSchema>;

export class ConfigFactory {
  public static create(): Config {
    try {
      return Value.Decode(configSchema, config);
    } catch (error) {
      if (error instanceof TransformDecodeCheckError) {
        throw new ConfigurationError({ ...error.error });
      }

      throw error;
    }
  }
}
