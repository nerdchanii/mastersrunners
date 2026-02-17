import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaError(e: unknown): e is PrismaClientKnownRequestError {
  return (
    e instanceof Error &&
    "code" in e &&
    typeof (e as PrismaClientKnownRequestError).code === "string" &&
    (e as PrismaClientKnownRequestError).code.startsWith("P")
  );
}

function getPrismaHttpStatus(code: string): { status: number; message: string } {
  switch (code) {
    case "P2002":
      return { status: HttpStatus.CONFLICT, message: "Unique constraint violation" };
    case "P2025":
      return { status: HttpStatus.NOT_FOUND, message: "Record not found" };
    case "P2003":
      return { status: HttpStatus.BAD_REQUEST, message: "Foreign key constraint violation" };
    case "P2014":
      return { status: HttpStatus.BAD_REQUEST, message: "Relation violation" };
    default:
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Database error" };
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (isPrismaError(exception)) {
      const prismaResult = getPrismaHttpStatus(exception.code);
      status = prismaResult.status;
      message = prismaResult.message;
      if (status >= 500) {
        this.logger.error(
          `Prisma error ${exception.code} at ${request.method} ${request.url}`,
          exception.stack,
        );
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
    }

    if (status >= 500 && !(isPrismaError(exception) && exception.code.startsWith("P2"))) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message: typeof message === "string" ? message : (message as any).message || message,
      timestamp: new Date().toISOString(),
    });
  }
}
