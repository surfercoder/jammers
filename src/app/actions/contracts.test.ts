import { createSupabaseMock, createQuery } from "@test/supabase";
import { revalidatePath } from "next/cache";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { createContract, setContractStatus } from "./contracts";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useClient(mock: ReturnType<typeof createSupabaseMock>) {
  mockedCreateClient.mockResolvedValue(mock as never);
}

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

const MUSICIAN_ID = "11111111-1111-4111-8111-111111111111";

const validContract = {
  musician_id: MUSICIAN_ID,
  title: "Play at my wedding",
  description: "A long set",
  event_date: "2026-08-01",
  venue: "Garden Hall",
  city: "Buenos Aires",
  budget: "500",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createContract", () => {
  it("returns field errors for invalid input", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await createContract({}, form({ musician_id: "nope" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(createContract({}, form(validContract))).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("rejects contracting yourself", async () => {
    useClient(createSupabaseMock({ user: { id: MUSICIAN_ID } }));
    const res = await createContract({}, form(validContract));
    expect(res.error).toMatch(/yourself/i);
  });

  it("surfaces a Supabase insert error", async () => {
    const q = createQuery({ data: null, error: { message: "boom" } });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    const res = await createContract({}, form(validContract));
    expect(res.error).toBe("boom");
  });

  it("inserts the contract and revalidates on success", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await createContract({}, form(validContract));
    expect(supabase.from).toHaveBeenCalledWith("contracts");
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        requester_id: "u1",
        musician_id: MUSICIAN_ID,
        title: "Play at my wedding",
        description: "A long set",
        event_date: "2026-08-01",
        venue: "Garden Hall",
        city: "Buenos Aires",
        budget: 500,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/contracts");
    expect(res.ok).toBe(true);
  });

  it("falls back to null for optional fields and budget", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await createContract(
      {},
      form({ musician_id: MUSICIAN_ID, title: "Just a title" })
    );
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
        event_date: null,
        venue: null,
        city: null,
        budget: null,
      })
    );
    expect(res.ok).toBe(true);
  });
});

describe("setContractStatus", () => {
  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(setContractStatus("c1", "accepted")).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("surfaces a Supabase update error", async () => {
    const q = createQuery({ data: null, error: { message: "nope" } });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    const res = await setContractStatus("c1", "accepted");
    expect(res).toEqual({ error: "nope" });
  });

  it("updates status and revalidates on success", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await setContractStatus("c1", "accepted");
    expect(supabase.from).toHaveBeenCalledWith("contracts");
    expect(q.update).toHaveBeenCalledWith({ status: "accepted" });
    expect(q.eq).toHaveBeenCalledWith("id", "c1");
    expect(revalidatePath).toHaveBeenCalledWith("/contracts");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(res).toEqual({ ok: true });
  });
});
