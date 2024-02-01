export interface ValidatePayload {
  readonly password: string;
}

export interface PasswordValidationService {
  validate(payload: ValidatePayload): void;
}
