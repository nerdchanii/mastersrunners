import { ConsoleLogger, Injectable, LogLevel } from "@nestjs/common";

type StructuredFields = Record<string, unknown>;

function serializeError(error: unknown) {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

@Injectable()
export class StructuredLoggerService extends ConsoleLogger {
  constructor() {
    super("Application");
  }

  logEvent(level: LogLevel, message: string, context: string, fields: StructuredFields = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...fields,
    };

    const line = `${JSON.stringify(payload)}\n`;
    if (level === "error" || level === "fatal" || level === "warn") {
      process.stderr.write(line);
      return;
    }
    process.stdout.write(line);
  }

  override log(message: unknown, context?: string) {
    this.logEvent("log", String(message), context ?? "Application");
  }

  override warn(message: unknown, context?: string) {
    this.logEvent("warn", String(message), context ?? "Application");
  }

  override debug(message: unknown, context?: string) {
    this.logEvent("debug", String(message), context ?? "Application");
  }

  override verbose(message: unknown, context?: string) {
    this.logEvent("verbose", String(message), context ?? "Application");
  }

  override error(message: unknown, trace?: string, context?: string) {
    this.logEvent("error", String(message), context ?? "Application", {
      trace,
    });
  }

  errorWithFields(message: string, context: string, fields: StructuredFields = {}) {
    this.logEvent("error", message, context, {
      ...fields,
      error: serializeError(fields.error),
    });
  }
}
