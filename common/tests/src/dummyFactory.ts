/* eslint-disable @typescript-eslint/no-explicit-any */

export class DummyFactory {
  public create<T extends object>(): T {
    const proxy = new Proxy({} as any, {
      get(target, property): any {
        if (!target[property]) {
          target[property] = (): void => {};
        }

        return target[property];
      },
    });

    return proxy as T;
  }
}
