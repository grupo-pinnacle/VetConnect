import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CallRoom, { type CallRoomPanel } from "../vet/CallRoom";

// JSDOM polyfill for scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock dependencies
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "vet-1", role: "VET", firstName: "Dra.", lastName: "Veterinaria" },
  }),
}));

const mockConsultationData = {
  id: "consult-123",
  status: "ACTIVE",
  petId: "pet-1",
  pet: { id: "pet-1", name: "Milo", species: "Canino", breed: "Labrador" },
  client: { firstName: "Juan", lastName: "Pérez" },
};
const emptyList: any[] = [];
const mockRefetch = vi.fn();
const mockConsultationResult = { data: mockConsultationData, refetch: mockRefetch };
const mockEmptyResult = { data: emptyList, refetch: mockRefetch };

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<any>("@tanstack/react-query");
  return {
    ...actual,
    useQuery: ({ queryKey }: { queryKey: any[] }) => {
      if (queryKey && queryKey[0] === "consultation") {
        return mockConsultationResult;
      }
      return mockEmptyResult;
    },
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
    }),
  };
});

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
  getAccessToken: () => "mock-token",
  getDeviceId: () => "mock-device",
}));

vi.mock("socket.io-client", () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  }),
}));

vi.mock("@livekit/components-react", () => ({
  LiveKitRoom: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  VideoConference: () => <div data-testid="livekit-videoconference">LiveKit VideoConference</div>,
  useLocalParticipant: () => ({
    localParticipant: { isMicrophoneEnabled: true, isCameraEnabled: true },
  }),
}));

describe("BUG-01: CallRoom Clean Stage Initialization", () => {
  beforeEach(() => {
    // Ensure desktop viewport by default (where BUG-01 manifests)
    window.innerWidth = 1200;
  });

  it("should verify CallRoomPanel type contract is exported and valid", () => {
    const validPanelClosed: CallRoomPanel = "";
    const validPanelChat: CallRoomPanel = "Chat";
    const validPanelFicha: CallRoomPanel = "Ficha";
    const validPanelEvo: CallRoomPanel = "Evolución";
    expect([validPanelClosed, validPanelChat, validPanelFicha, validPanelEvo]).toBeDefined();
  });

  it("initializes CallRoom with panel collapsed (is-closed, display: none) on desktop so video has total priority", () => {
    const { container } = render(<CallRoom id="consult-123" />);

    const panelAside = container.querySelector("aside.v-call__panel");
    expect(panelAside).toBeTruthy();

    // The panel should be closed initially to avoid covering the video stage
    expect(panelAside?.classList.contains("is-closed")).toBe(true);
    expect(panelAside?.classList.contains("is-open")).toBe(false);
    expect(panelAside?.getAttribute("style")).toContain("display: none");

    // The Chat button in navigation controls should not be toggled active (not 'is-on')
    const chatBtn = screen.getByRole("button", { name: /Chat/i });
    expect(chatBtn.classList.contains("is-on")).toBe(false);
    expect(chatBtn.getAttribute("aria-pressed")).toBe("false");
  });
});
