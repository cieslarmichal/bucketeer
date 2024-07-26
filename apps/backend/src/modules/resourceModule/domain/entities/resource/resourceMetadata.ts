export interface ResourceMetadata {
  readonly id: string;
  readonly name: string;
  readonly updatedAt: Date;
  readonly contentSize: number;
  readonly contentType: string;
  readonly url: string;
  readonly previewUrl: string;
}
