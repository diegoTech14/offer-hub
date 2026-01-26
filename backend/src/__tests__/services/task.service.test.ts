// __tests__/task.service.spec.ts
import { getTaskRecordsByClient } from "@/services/task.service";
import { InternalServerError } from "@/utils/AppError";

// Mock the supabase client module
jest.mock("@/lib/supabase/supabase", () => {
  // create a chainable builder factory we can control per-test
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

import { supabase } from "@/lib/supabase/supabase";

describe("getTaskRecordsByClient (service)", () => {
  const mockChainFactory = (result: any) => {
    // methods return this chain so you can call eq/order/range etc.
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue(result),
    };
    return chain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated results and meta when supabase returns data", async () => {
    const fakeRows = Array.from({ length: 3 }).map((_, i) => ({
      id: `id-${i}`,
      client_id: "client-uuid",
      project_title: `project-${i}`,
      freelancer_name: `fr-${i}`,
      completed: true,
      created_at: new Date().toISOString(),
    }));
    // supabase returns data, no error, count total
    const result = { data: fakeRows, error: null, count: 42 };
    const chain = mockChainFactory(result);
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const res = await getTaskRecordsByClient("client-uuid", 10, 1, true);

    expect(supabase.from).toHaveBeenCalledWith("vw_task_records_for_client");
    // confirm we chained eq('client_id', ...) and eq('completed', true)
    expect(chain.eq).toHaveBeenCalledWith("client_id", "client-uuid");
    expect(chain.eq).toHaveBeenCalledWith("completed", true);
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(res.data).toEqual(fakeRows);
    expect(res.meta.total_items).toEqual(42);
    expect(res.meta.page).toEqual(1);
    expect(res.meta.limit).toEqual(10);
  });

  it("applies default pagination if invalid page/limit provided", async () => {
    const rows = [{ id: "r1" }];
    const result = { data: rows, error: null, count: 1 };
    const chain = mockChainFactory(result);
    (supabase.from as jest.Mock).mockReturnValue(chain);

    const res = await getTaskRecordsByClient("client-uuid", NaN as any, NaN as any);

    // default limit=20, page=1 -> from 0 to 19
    expect(chain.range).toHaveBeenCalledWith(0, 19);
    expect(res.meta.limit).toBe(20);
  });

  it("throws InternalServerError when supabase returns an error", async () => {
    const result = { data: null, error: { message: "db error" }, count: null };
    const chain = mockChainFactory(result);
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await expect(getTaskRecordsByClient("client-uuid", 10, 1)).rejects.toThrow(InternalServerError);
  });

  it("does not call completed filter if completed undefined", async () => {
    const result = { data: [], error: null, count: 0 };
    const chain = mockChainFactory(result);
    (supabase.from as jest.Mock).mockReturnValue(chain);

    await getTaskRecordsByClient("client-uuid", 5, 2, undefined);

    // eq called with client_id only (and possibly other eq calls but not completed).
    // We assert that none of the eq calls used "completed" as first arg.
    const eqCalls = (chain.eq as jest.Mock).mock.calls;
    const hadCompleted = eqCalls.some((c: any[]) => c[0] === "completed");
    expect(hadCompleted).toBe(false);
  });
});
