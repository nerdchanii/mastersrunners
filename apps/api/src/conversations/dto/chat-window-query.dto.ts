import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString } from "class-validator";

import { toOptionalInt } from "../../common/dto/query-transformers.js";

export class ChatWindowQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsIn(["older", "newer"])
  direction?: "older" | "newer";

  @IsOptional()
  @IsIn(["latest", "unread"])
  entry?: "latest" | "unread";

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  historyLimit?: number;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  unreadLimit?: number;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  limit?: number;

  resolveDirection() {
    return this.direction;
  }

  resolveEntry() {
    return this.entry ?? "unread";
  }

  resolveHistoryLimit(defaultValue: number, maxValue: number) {
    const normalized = this.historyLimit ?? defaultValue;
    return Math.min(Math.max(1, normalized), maxValue);
  }

  resolveUnreadLimit(defaultValue: number, maxValue: number) {
    const normalized = this.unreadLimit ?? defaultValue;
    return Math.min(Math.max(1, normalized), maxValue);
  }

  resolveDirectionalLimit(defaultValue: number, maxValue: number) {
    const normalized = this.limit ?? defaultValue;
    return Math.min(Math.max(1, normalized), maxValue);
  }
}
