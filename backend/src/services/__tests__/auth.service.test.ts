import { getUserSessions } from "../auth.service";
import { supabase } from "@/lib/supabase/supabase";

jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock other dependencies if needed
jest.mock("@/utils/jwt.utils", () => ({
  hashToken: jest.fn(),
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../user.service", () => ({
  userService: {},
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe("getUserSessions", () => {
  const userId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return formatted sessions with is_current true for matching IP/UA", async () => {
    const mockSessions = [
      {
        id: "session-1",
        created_at: "2023-01-01T00:00:00Z",
        expires_at: "2025-01-08T00:00:00Z",
        device_info: {
          ip_address: "127.0.0.1",
          user_agent: "Mozilla/5.0 TestBrowser",
          type: "desktop",
          os: "Linux",
          browser: "TestBrowser",
        },
        last_activity_at: null,
      },
      {
        id: "session-2",
        created_at: "2023-01-02T00:00:00Z",
        expires_at: "2025-01-09T00:00:00Z",
        device_info: {
          ip_address: "192.168.1.1",
          user_agent: "OtherBrowser",
          type: "mobile",
          os: "Android",
          browser: "Chrome",
        },
        last_activity_at: null,
      },
    ];

    // Mock chain: from -> select -> eq -> eq -> gt -> order
    const mockOrder = jest
      .fn()
      .mockResolvedValue({ data: mockSessions, error: null });
    const mockGt = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq2 = jest.fn().mockReturnValue({ gt: mockGt });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    mockedSupabase.from = mockFrom as any;

    const result = await getUserSessions(
      userId,
      "127.0.0.1",
      "Mozilla/5.0 TestBrowser",
    );

    expect(result).toHaveLength(2);

    // Check first session (matching)
    expect(result[0].id).toBe("session-1");
    expect(result[0].is_current).toBe(true);
    expect(result[0].device_info.browser).toBe("TestBrowser");
    expect(result[0].device_info.os).toBe("Linux");
    expect(result[0].device_info.device).toBe("desktop");

    // Check second session (not matching)
    expect(result[1].id).toBe("session-2");
    expect(result[1].is_current).toBe(false);
    expect(result[1].device_info.browser).toBe("Chrome");
  });

  it("should handle missing device info gracefully", async () => {
    const mockSessions = [
      {
        id: "session-3",
        created_at: "2023-01-03T00:00:00Z",
        expires_at: "2025-01-10T00:00:00Z",
        // No device_info
        last_activity_at: null,
      },
    ];

    const mockOrder = jest
      .fn()
      .mockResolvedValue({ data: mockSessions, error: null });
    const mockGt = jest.fn().mockReturnValue({ order: mockOrder });
    const mockEq2 = jest.fn().mockReturnValue({ gt: mockGt });
    const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq1 });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    mockedSupabase.from = mockFrom as any;

    const result = await getUserSessions(
      userId,
      "127.0.0.1",
      "Mozilla/5.0 TestBrowser",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("session-3");
    expect(result[0].is_current).toBe(false);
    expect(result[0].device_info.browser).toBe("Unknown");
  });
});
