import { Transform } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { toOptionalInt } from "./query-transformers.js";

export class LimitQueryDto {
  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  limit?: number;

  resolveLimit(defaultValue: number, maxValue?: number): number {
    const normalized = this.limit ?? defaultValue;
    const minimumBounded = Math.max(1, normalized);

    return maxValue === undefined ? minimumBounded : Math.min(minimumBounded, maxValue);
  }

  resolveOptionalLimit(maxValue?: number): number | undefined {
    if (this.limit === undefined) {
      return undefined;
    }

    const minimumBounded = Math.max(1, this.limit);
    return maxValue === undefined ? minimumBounded : Math.min(minimumBounded, maxValue);
  }
}
