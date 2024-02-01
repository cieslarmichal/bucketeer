import { faker } from '@faker-js/faker';

export class Generator {
  public static email(): string {
    return faker.internet.email();
  }

  public static number(min = 0, max = 100, precision = 1): number {
    return faker.number.float({
      min,
      max,
      precision,
    });
  }

  public static string(length: number): string {
    return faker.string.sample(length);
  }

  public static alphanumericString(length: number, casing: 'lower' | 'upper' = 'lower'): string {
    return faker.string.alphanumeric({
      casing,
      length,
    });
  }

  public static alphaString(length: number, casing: 'lower' | 'upper' = 'lower'): string {
    return faker.string.alpha({
      casing,
      length,
    });
  }

  public static numericString(length: number): string {
    return faker.string.numeric({
      length,
    });
  }

  public static uuid(): string {
    return faker.string.uuid();
  }

  public static arrayElement<T>(array: T[]): T {
    return faker.helpers.arrayElement(array);
  }

  public static firstName(): string {
    return faker.person.firstName();
  }

  public static lastName(): string {
    return faker.person.lastName();
  }

  public static word(): string {
    return faker.lorem.word();
  }

  public static url(): string {
    return faker.internet.url();
  }

  public static boolean(): boolean {
    return faker.datatype.boolean();
  }

  public static password(): string {
    let password = faker.internet.password({
      length: 13,
    });

    password += Generator.alphaString(1, 'upper');

    password += Generator.alphaString(1, 'lower');

    password += Generator.numericString(1);

    return password;
  }

  public static sentences(count = 3): string {
    return faker.lorem.sentences(count);
  }

  public static sentence(): string {
    return faker.lorem.sentence();
  }

  public static words(count = 3): string {
    return faker.lorem.words(count);
  }

  public static futureDate(): Date {
    return faker.date.future();
  }

  public static pastDate(): Date {
    return faker.date.past();
  }

  public static country(): string {
    return faker.location.country();
  }

  public static city(): string {
    return faker.location.city();
  }

  public static street(): string {
    return faker.location.street();
  }

  public static streetAddress(): string {
    return faker.location.streetAddress();
  }

  public static buildingNumber(): string {
    return faker.location.buildingNumber();
  }

  public static zipCode(): string {
    return faker.location.zipCode();
  }

  public static imageUrl(width = 640, height = 480): string {
    return faker.image.url({
      width,
      height,
    });
  }
}
