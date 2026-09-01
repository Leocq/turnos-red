export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}
