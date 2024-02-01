export interface CommandHandler<Payload, Result> {
  execute(payload: Payload): Promise<Result>;
}
