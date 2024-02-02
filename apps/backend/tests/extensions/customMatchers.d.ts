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
  toThrowErrorInstance(payload: ToThrowErrorInstancePayload): T;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
