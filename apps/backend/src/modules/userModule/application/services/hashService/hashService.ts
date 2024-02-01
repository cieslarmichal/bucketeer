export interface HashPayload {
  readonly plainData: string;
}

export interface ComparePayload {
  readonly plainData: string;
  readonly hashedData: string;
}

export interface HashService {
  hash(payload: HashPayload): Promise<string>;
  compare(payload: ComparePayload): Promise<boolean>;
}
