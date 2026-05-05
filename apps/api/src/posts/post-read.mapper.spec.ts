import { mapPostForRead } from "./post-read.mapper";

describe("mapPostForRead", () => {
  it("maps attached workout encodedPolyline into the legacy route preview shape", () => {
    const result = mapPostForRead({
      id: "post-1",
      images: [],
      workouts: [
        {
          workout: {
            id: "workout-1",
            title: "Tempo",
            encodedPolyline: "summary-polyline",
          },
        },
        {
          workout: {
            id: "workout-2",
            title: "No GPS",
            encodedPolyline: null,
          },
        },
      ],
    });

    expect(result.workouts).toEqual([
      {
        workout: {
          id: "workout-1",
          title: "Tempo",
          route: { encodedPolyline: "summary-polyline" },
        },
      },
      {
        workout: {
          id: "workout-2",
          title: "No GPS",
          route: null,
        },
      },
    ]);
  });
});
