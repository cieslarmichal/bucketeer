export interface QueryHandler<Payload, Result> {
  execute(payload: Payload): Promise<Result>;
}
