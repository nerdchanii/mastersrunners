import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { SubmitEventResultDto } from "./submit-event-result.dto.js";

describe("SubmitEventResultDto", () => {
  it("allows DNS without resultTime", async () => {
    const dto = plainToInstance(SubmitEventResultDto, {
      status: "DNS",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it("requires resultTime for COMPLETED", async () => {
    const dto = plainToInstance(SubmitEventResultDto, {
      status: "COMPLETED",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe("resultTime");
  });
});
