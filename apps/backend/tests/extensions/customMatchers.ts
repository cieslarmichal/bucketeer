import { expect } from 'vitest';

interface MatcherResult {
  pass: boolean;
  message: () => string;
  // If you pass these, they will automatically appear inside a diff when
  // the matcher does not pass, so you don't need to print the diff yourself
  actual?: unknown;
  expected?: unknown;
}

export interface ToThrowErrorInstancePayload {
  message?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  instance: Function;
  context?: {
    [key: string]: unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}

interface CustomMatchers<T = unknown> {
  toThrowErrorInstance(payload: ToThrowErrorInstancePayload): Promise<T>;
}

interface ErrorWithContext {
  context: {
    [key: string]: unknown;
  };
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

async function toThrowErrorInstance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: () => any | Promise<any>,
  expectedPayload: ToThrowErrorInstancePayload,
): Promise<MatcherResult> {
  const { instance, context, message } = expectedPayload;

  try {
    await callback();
  } catch (error) {
    const isInstanceOf = error instanceof instance;

    if (!isInstanceOf) {
      return {
        pass: false,
        message: () => message || `Expected error to be instance of ${instance.toString()}.`,
        actual: error,
        expected: instance,
      };
    }

    if (context && Object.hasOwn(error, 'context')) {
      expect((error as ErrorWithContext).context).toMatchObject(context);
    }

    return {
      pass: true,
      message: () => 'Passed.',
    };
  }

  return {
    pass: false,
    message: () => 'Expected callback to throw an error.',
  };
}

expect.extend({
  toThrowErrorInstance,
});
