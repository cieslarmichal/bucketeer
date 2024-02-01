import { Container, type interfaces } from 'inversify';

export interface FactoryLike<T> {
  create(): T;
}

export class DependencyInjectionContainer {
  private instance: Container;

  public constructor() {
    this.instance = new Container({
      autoBindInjectable: false,
      defaultScope: 'Singleton',
    });
  }

  public bindToValue<T>(symbol: symbol, value: T): DependencyInjectionContainer {
    this.instance.bind(symbol).toConstantValue(value);

    return this;
  }

  public bind<T>(symbol: symbol, dynamicValue: interfaces.DynamicValue<T>): DependencyInjectionContainer {
    this.instance.bind(symbol).toDynamicValue(dynamicValue);

    return this;
  }

  public overrideBinding<T>(symbol: symbol, dynamicValue: interfaces.DynamicValue<T>): DependencyInjectionContainer {
    this.instance.rebind(symbol).toDynamicValue(dynamicValue);

    return this;
  }

  public get<T>(symbol: symbol): T {
    return this.instance.get(symbol);
  }
}
