export interface DatabaseTable<Entity> {
  readonly name: string;
  readonly columns: Record<keyof Entity, string>;
}
