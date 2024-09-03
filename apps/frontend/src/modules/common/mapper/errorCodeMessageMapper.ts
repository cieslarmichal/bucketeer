export class ErrorCodeMessageMapper {
  private readonly defaults: Record<number, string> = {
    400: 'Invalid payload.',
    401: 'Access denied.',
    403: 'Action forbidden.',
    500: 'Internal server error.',
  };

  private errorMap: Record<number, string>;

  public constructor(errorMap: Record<number, string>) {
    this.errorMap = {
      ...this.defaults,
      ...errorMap,
    };
  }

  public map(code: number): string {
    const message = this.errorMap[code];

    if (!message) {
      return `Unknown error.`;
    }

    return message;
  }
}
