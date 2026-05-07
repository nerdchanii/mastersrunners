import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CrewsPage from "../index";

const {
  crewExploreMock,
  myCrewsMock,
  regionsMock,
  recommendMock,
  subRegionsHookMock,
  subRegionsMock,
} = vi.hoisted(() => ({
  crewExploreMock: vi.fn(),
  myCrewsMock: vi.fn(),
  regionsMock: vi.fn(),
  recommendMock: vi.fn(),
  subRegionsHookMock: vi.fn(),
  subRegionsMock: vi.fn(),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

vi.mock("@/hooks/useCrews", () => ({
  useMyCrews: (...args: unknown[]) => myCrewsMock(...args),
}));

vi.mock("@/hooks/useCrewExplore", () => ({
  useCrewExplore: (...args: unknown[]) => crewExploreMock(...args),
  useCrewRecommend: (...args: unknown[]) => recommendMock(...args),
  useRegions: (...args: unknown[]) => regionsMock(...args),
  useSubRegions: (...args: unknown[]) => subRegionsHookMock(...args),
}));

describe("CrewsPage region filters", () => {
  beforeEach(() => {
    myCrewsMock.mockReturnValue({ data: [], isLoading: false });
    recommendMock.mockReturnValue({ data: [] });
    regionsMock.mockReturnValue({
      data: [
        { region: "경상남도", crewCount: 2 },
        { region: "서울", crewCount: 1 },
        { region: "부산광역시", crewCount: 4 },
        { region: "서울특별시", crewCount: 3 },
      ],
    });
    subRegionsMock.mockImplementation(
      (region: string) =>
        ({
          "": [],
          서울특별시: [{ subRegion: "강남구", crewCount: 2 }],
          서울: [{ subRegion: "강남", crewCount: 1 }],
        })[region] ?? [],
    );
    subRegionsHookMock.mockImplementation((region: string) => ({
      data: subRegionsMock(region),
    }));
    crewExploreMock.mockReturnValue({
      data: { items: [], nextCursor: null },
      isLoading: false,
    });
  });

  it("renders server-returned region buckets in shared canonical order", () => {
    render(
      <BrowserRouter>
        <CrewsPage />
      </BrowserRouter>,
    );

    const seoulCanonical = screen.getByText("서울 (3)");
    const seoulLegacy = screen.getByText("서울 (1)");
    const busan = screen.getByText("부산 (4)");
    const gyeongnam = screen.getByText("경상남 (2)");

    expect(seoulCanonical.compareDocumentPosition(seoulLegacy)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(seoulLegacy.compareDocumentPosition(busan)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(busan.compareDocumentPosition(gyeongnam)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("keeps selected raw region values driving sub-region lookup and explore filtering", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <CrewsPage />
      </BrowserRouter>,
    );

    await user.click(screen.getByText("서울 (1)"));

    await waitFor(() => {
      expect(subRegionsHookMock).toHaveBeenLastCalledWith("서울");
      expect(crewExploreMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          region: "서울",
          subRegion: undefined,
        }),
      );
    });

    await user.click(screen.getByText("강남 (1)"));

    await waitFor(() => {
      expect(crewExploreMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          region: "서울",
          subRegion: "강남",
        }),
      );
    });
  });
});
