import { IError } from "../interfaces/error.interface";

export class ErrorResponce extends Error implements IError {
  constructor(
    message: string,
    public status: number,
    cause?: unknown,
  ) {
    super(message, { cause });
  }
}

export class BadRequestError extends ErrorResponce {
  constructor(message: string = "Bad Request", cause?: unknown) {
    super(message, 400, cause);
  }
}
export class UnauthorizedError extends ErrorResponce {
  constructor(message: string = "Unauthorized", cause?: unknown) {
    super(message, 401, cause);
  }
}
export class ForbiddenError extends ErrorResponce {
  constructor(message: string = "Forbidden", cause?: unknown) {
    super(message, 403, cause);
  }
}
export class NotFoundError extends ErrorResponce {
  constructor(message: string = "Not Found", cause?: unknown) {
    super(message, 404, cause);
  }
}
export class InternalServerError extends ErrorResponce {
  constructor(message: string = "Internal Server Error", cause?: unknown) {
    super(message, 500, cause);
  }
}
export class ConflictError extends ErrorResponce {
  constructor(message: string = "Conflict", cause?: unknown) {
    super(message, 409, cause);
  }
}
export class TooManyRequestsError extends ErrorResponce {
  constructor(message: string = "Too Many Requests", cause?: unknown) {
    super(message, 429, cause);
  }
}
export class BadGatewayError extends ErrorResponce {
  constructor(message: string = "Bad Gateway", cause?: unknown) {
    super(message, 502, cause);
  }
}
export class ServiceUnavailableError extends ErrorResponce {
  constructor(message: string = "Service Unavailable", cause?: unknown) {
    super(message, 503, cause);
  }
}

export class badRequestError extends ErrorResponce {
  constructor(message: string = "Bad Request", cause?: unknown) {
    super(message, 400, cause);
  }
}
