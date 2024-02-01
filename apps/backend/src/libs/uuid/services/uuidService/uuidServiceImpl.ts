import { v4 as uuidv4 } from 'uuid';

import { type UuidService } from './uuidService.js';

export class UuidServiceImpl implements UuidService {
  public generateUuid(): string {
    return uuidv4();
  }
}
