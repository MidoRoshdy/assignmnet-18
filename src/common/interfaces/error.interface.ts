export interface IError {
  message: string;
  status: number;
  cause?: unknown;
}
