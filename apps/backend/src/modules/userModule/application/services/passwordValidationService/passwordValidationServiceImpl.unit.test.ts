import { beforeEach, describe, expect, it } from 'vitest';

import { PasswordValidationServiceImpl } from './passwordValidationServiceImpl.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';

describe('PasswordValidationServiceImpl', () => {
  let passwordValidationService: PasswordValidationServiceImpl;

  beforeEach(() => {
    passwordValidationService = new PasswordValidationServiceImpl();
  });

  it('should not throw an error if the password is valid', async () => {
    const password = 'Password123';

    expect(() => passwordValidationService.validate({ password })).not.toThrow();
  });

  it('should throw an error if the password is less than 8 characters long', async () => {
    const password = '1234567';

    expect(() => passwordValidationService.validate({ password })).toThrowErrorInstance({
      instance: OperationNotValidError,
      message: 'Password must be at least 8 characters long.',
    });
  });

  it('should throw an error if the password does not contain a number', async () => {
    const password = 'abcdefgh';

    expect(() => passwordValidationService.validate({ password })).toThrowErrorInstance({
      instance: OperationNotValidError,
      message: 'Password must contain at least one number.',
    });
  });

  it('should throw an error if the password does not contain a lowercase letter', async () => {
    const password = 'ABCDEFGH';

    expect(() => passwordValidationService.validate({ password })).toThrowErrorInstance({
      instance: OperationNotValidError,
      message: 'Password must contain at least one lowercase letter.',
    });
  });

  it('should throw an error if the password does not contain an uppercase letter', async () => {
    const password = 'abcdefgh';

    expect(() => passwordValidationService.validate({ password })).toThrowErrorInstance({
      instance: OperationNotValidError,
      message: 'Password must contain at least one uppercase letter.',
    });
  });
});
