/**
 * Domain errors.
 *
 * Services throw these; Route Handlers map them to status codes. The point is
 * that a service never knows about HTTP, and a route never re-implements a
 * rule. `status` is a hint for the boundary, not a coupling.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string) {
    super(message, "validation_failed", 422);
  }
}

export class NotFoundError extends ServiceError {
  constructor(what: string) {
    super(`${what} not found`, "not_found", 404);
  }
}

export class InsufficientFundsError extends ServiceError {
  constructor(message: string) {
    super(message, "insufficient_funds", 422);
  }
}

export class ConflictError extends ServiceError {
  constructor(message: string) {
    super(message, "conflict", 409);
  }
}
