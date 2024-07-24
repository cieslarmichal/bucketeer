
export interface BaseApiError {
    message: string;
    context: Record<string, unknown>;
}