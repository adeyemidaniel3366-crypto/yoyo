// ---------------------------------------------------------------------------
// Zino One — Typed Domain Error Classes (§7.1, §15)
// ---------------------------------------------------------------------------

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INSUFFICIENT_STOCK"
  | "BUSINESS_RULE"
  | "RATE_LIMITED"
  | "PAYMENT_FAILED"
  | "INTERNAL";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(409, "CONFLICT", message, details);
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, available: number, requested?: number) {
    super(
      409,
      "INSUFFICIENT_STOCK",
      `Insufficient stock for ${productName} (available: ${available})`,
      { productName, available, requested }
    );
  }
}

export class BusinessError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(422, "BUSINESS_RULE", message, details);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterSec: number;

  constructor(retryAfterSec: number) {
    super(429, "RATE_LIMITED", "Too many requests. Please try again later.", {
      retryAfter: retryAfterSec,
    });
    this.retryAfterSec = retryAfterSec;
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(422, "PAYMENT_FAILED", message, details);
  }
}
