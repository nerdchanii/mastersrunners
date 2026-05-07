import { describe, expect, it } from "vitest";

import {
  getRegionDisplayLabel,
  normalizeRegionSelection,
  sortByCanonicalRegionOrder,
} from "./regions";

describe("regions helpers", () => {
  it("sorts region buckets in canonical Korean region order without collapsing legacy buckets", () => {
    const ordered = sortByCanonicalRegionOrder(
      [
        { region: "경상남도", crewCount: 2 },
        { region: "서울", crewCount: 1 },
        { region: "서울특별시", crewCount: 3 },
        { region: "부산광역시", crewCount: 4 },
      ],
      (item) => item.region,
    );

    expect(ordered.map((item) => item.region)).toEqual([
      "서울특별시",
      "서울",
      "부산광역시",
      "경상남도",
    ]);
  });

  it("formats canonical region labels without administrative suffixes", () => {
    expect(getRegionDisplayLabel("서울특별시")).toBe("서울");
    expect(getRegionDisplayLabel("강원특별자치도")).toBe("강원");
    expect(getRegionDisplayLabel("제주특별자치도")).toBe("제주");
  });

  it("normalizes common legacy region and sub-region abbreviations into canonical values", () => {
    expect(normalizeRegionSelection("서울", "강남")).toEqual({
      region: "서울특별시",
      subRegion: "강남구",
    });
    expect(normalizeRegionSelection("경기", "성남")).toEqual({
      region: "경기도",
      subRegion: "성남시",
    });
  });

  it("drops unmappable legacy values instead of inventing a canonical selection", () => {
    expect(normalizeRegionSelection("서울", "없는동네")).toEqual({
      region: "서울특별시",
      subRegion: "",
    });
    expect(normalizeRegionSelection("모름", "강남")).toEqual({
      region: "",
      subRegion: "",
    });
  });
});
