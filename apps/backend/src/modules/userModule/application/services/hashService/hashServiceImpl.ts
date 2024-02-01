import { compare, genSalt, hash } from 'bcrypt';

import { type ComparePayload, type HashPayload, type HashService } from './hashService.js';
import { type UserModuleConfigProvider } from '../../../userModuleConfigProvider.js';

export class HashServiceImpl implements HashService {
  public constructor(private readonly configProvider: UserModuleConfigProvider) {}

  public async hash(payload: HashPayload): Promise<string> {
    const { plainData } = payload;

    const salt = await this.generateSalt();

    return hash(plainData, salt);
  }

  public async compare(payload: ComparePayload): Promise<boolean> {
    const { plainData, hashedData } = payload;

    return compare(plainData, hashedData);
  }

  private async generateSalt(): Promise<string> {
    const hashSaltRounds = this.configProvider.getHashSaltRounds();

    return genSalt(hashSaltRounds);
  }
}
