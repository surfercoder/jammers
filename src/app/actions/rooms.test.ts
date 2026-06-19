import { createSupabaseMock, createQuery } from "@test/supabase";
import { revalidatePath } from "next/cache";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { roomSchema } from "@/lib/validations";
import {
  createBooking,
  setBookingStatus,
  toggleSaveRoom,
  createReview,
  createRoom,
} from "./rooms";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

function useClient(mock: ReturnType<typeof createSupabaseMock>) {
  mockedCreateClient.mockResolvedValue(mock as never);
}

function form(values: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
    else fd.append(k, v);
  }
  return fd;
}

const ROOM_ID = "22222222-2222-4222-8222-222222222222";

const validBooking = {
  room_id: ROOM_ID,
  date: "2026-08-01",
  start: "10:00",
  hours: "2",
  notes: "Need a drum kit",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createBooking", () => {
  it("returns field errors for invalid input", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await createBooking({}, form({ room_id: "nope" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(createBooking({}, form(validBooking))).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("returns an error when the room is not found", async () => {
    const from = (table: string) =>
      table === "rehearsal_rooms"
        ? createQuery({ data: null, error: null })
        : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await createBooking({}, form(validBooking));
    expect(res).toEqual({ error: "Room not found." });
  });

  it("returns an error for an invalid date/time", async () => {
    const from = (table: string) =>
      table === "rehearsal_rooms"
        ? createQuery({
            data: { hourly_price: 100, slug: "studio-a" },
            error: null,
          })
        : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await createBooking(
      {},
      form({ ...validBooking, date: "not-a-date", start: "99:99" })
    );
    expect(res).toEqual({ error: "Invalid date/time." });
  });

  it("surfaces a Supabase insert error", async () => {
    const bookingQuery = createQuery({
      data: null,
      error: { message: "bookboom" },
    });
    const from = (table: string) => {
      if (table === "rehearsal_rooms") {
        return createQuery({
          data: { hourly_price: 100, slug: "studio-a" },
          error: null,
        });
      }
      return bookingQuery;
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await createBooking({}, form(validBooking));
    expect(res).toEqual({ error: "bookboom" });
  });

  it("inserts the booking and revalidates on success", async () => {
    const bookingQuery = createQuery({ data: null, error: null });
    const from = (table: string) => {
      if (table === "rehearsal_rooms") {
        return createQuery({
          data: { hourly_price: 100, slug: "studio-a" },
          error: null,
        });
      }
      return bookingQuery;
    };
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    const res = await createBooking({}, form(validBooking));
    expect(bookingQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: ROOM_ID,
        requester_id: "u1",
        total_price: 200,
        notes: "Need a drum kit",
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/bookings");
    expect(revalidatePath).toHaveBeenCalledWith("/rooms/studio-a");
    expect(res).toEqual({ ok: true });
  });

  it("falls back to null notes when omitted", async () => {
    const bookingQuery = createQuery({ data: null, error: null });
    const from = (table: string) => {
      if (table === "rehearsal_rooms") {
        return createQuery({
          data: { hourly_price: 100, slug: "studio-a" },
          error: null,
        });
      }
      return bookingQuery;
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await createBooking(
      {},
      form({ room_id: ROOM_ID, date: "2026-08-01", start: "10:00", hours: "1" })
    );
    expect(bookingQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ notes: null })
    );
  });
});

describe("setBookingStatus", () => {
  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(setBookingStatus("b1", "confirmed")).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("surfaces a Supabase update error", async () => {
    const q = createQuery({ data: null, error: { message: "statusboom" } });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    const res = await setBookingStatus("b1", "confirmed");
    expect(res).toEqual({ error: "statusboom" });
  });

  it("updates booking status and revalidates", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await setBookingStatus("b1", "confirmed");
    expect(supabase.from).toHaveBeenCalledWith("room_bookings");
    expect(q.update).toHaveBeenCalledWith({ status: "confirmed" });
    expect(q.eq).toHaveBeenCalledWith("id", "b1");
    expect(revalidatePath).toHaveBeenCalledWith("/bookings");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(res).toEqual({ ok: true });
  });
});

describe("toggleSaveRoom", () => {
  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(toggleSaveRoom("r1", true)).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("deletes the saved row when already saved", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await toggleSaveRoom("r1", true);
    expect(q.delete).toHaveBeenCalled();
    expect(q.eq).toHaveBeenCalledWith("profile_id", "u1");
    expect(q.eq).toHaveBeenCalledWith("room_id", "r1");
    expect(revalidatePath).toHaveBeenCalledWith("/explore");
    expect(res).toEqual({ ok: true });
  });

  it("inserts a saved row when not yet saved", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await toggleSaveRoom("r1", false);
    expect(q.insert).toHaveBeenCalledWith({
      profile_id: "u1",
      room_id: "r1",
    });
    expect(res).toEqual({ ok: true });
  });

  it("surfaces a Supabase error from the toggle", async () => {
    const q = createQuery({ data: null, error: { message: "toggleboom" } });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    const res = await toggleSaveRoom("r1", false);
    expect(res).toEqual({ error: "toggleboom" });
  });
});

describe("createReview", () => {
  const validReview = { room_id: ROOM_ID, rating: "5", comment: "Great" };

  it("returns field errors for invalid input", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await createReview({}, form({ room_id: "nope" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(createReview({}, form(validReview))).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in"
    );
  });

  it("surfaces a Supabase upsert error", async () => {
    const q = createQuery({ data: null, error: { message: "reviewboom" } });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    const res = await createReview({}, form(validReview));
    expect(res).toEqual({ error: "reviewboom" });
  });

  it("upserts the review and revalidates", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const res = await createReview({}, form(validReview));
    expect(q.upsert).toHaveBeenCalledWith(
      {
        room_id: ROOM_ID,
        author_id: "u1",
        rating: 5,
        comment: "Great",
      },
      { onConflict: "room_id,author_id" }
    );
    expect(revalidatePath).toHaveBeenCalledWith("/rooms", "layout");
    expect(res).toEqual({ ok: true });
  });

  it("falls back to a null comment when omitted", async () => {
    const q = createQuery({ data: null, error: null });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    await createReview({}, form({ room_id: ROOM_ID, rating: "4" }));
    expect(q.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ comment: null }),
      { onConflict: "room_id,author_id" }
    );
  });
});

describe("createRoom", () => {
  const validRoom = {
    name: "Sunset Studio",
    description: "Cozy",
    neighborhood: "Palermo",
    address: "123 St",
    latitude: "-34.6",
    longitude: "-58.4",
    hourly_price: "100",
    capacity: "5",
    photos: "",
  };

  it("returns field errors for invalid input", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await createRoom({}, form({ name: "ab" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(
      createRoom(
        {},
        form({ ...validRoom, amenities: ["wifi"], photos: "" })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("surfaces a Supabase insert error", async () => {
    const q = createQuery({ data: null, error: { message: "roomboom" } });
    useClient(createSupabaseMock({ user: { id: "u1" }, from: () => q }));
    const res = await createRoom(
      {},
      form({ ...validRoom, amenities: ["wifi"] })
    );
    expect(res).toEqual({ error: "roomboom" });
  });

  it("parses photos, builds a slug and redirects on success", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    await expect(
      createRoom(
        {},
        form({
          ...validRoom,
          amenities: ["wifi", "parking"],
          photos: "https://a.test/1.png\nhttps://a.test/2.png,  ",
        })
      )
    ).rejects.toThrow(/^NEXT_REDIRECT:\/rooms\/sunset-studio-/);
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        owner_id: "u1",
        name: "Sunset Studio",
        neighborhood: "Palermo",
        amenities: ["wifi", "parking"],
        photos: ["https://a.test/1.png", "https://a.test/2.png"],
      })
    );
    const inserted = q.insert.mock.calls[0][0] as { slug: string };
    expect(inserted.slug).toMatch(/^sunset-studio-[0-9a-z]{1,4}$/);
  });

  it("defaults photos to an empty array and nulls optional fields when omitted", async () => {
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    await expect(
      createRoom(
        {},
        form({
          name: "Sunset Studio",
          description: "",
          address: "",
          neighborhood: "Palermo",
          latitude: "-34.6",
          longitude: "-58.4",
          hourly_price: "100",
          capacity: "5",
          photos: "",
        })
      )
    ).rejects.toThrow(/^NEXT_REDIRECT:\/rooms\/sunset-studio-/);
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
        address: null,
        amenities: [],
        photos: [],
      })
    );
  });

  it("falls back to [] when parsed photos is undefined", async () => {
    // The schema requires `photos`, so a successful parse always yields an
    // array — the `?? []` defensive fallback is otherwise unreachable. Force
    // an undefined `photos` on the parsed data to exercise that branch.
    const q = createQuery({ data: null, error: null });
    const supabase = createSupabaseMock({ user: { id: "u1" }, from: () => q });
    useClient(supabase);
    const spy = jest.spyOn(roomSchema, "safeParse").mockReturnValueOnce({
      success: true,
      data: {
        name: "Sunset Studio",
        description: "",
        neighborhood: "Palermo",
        address: "",
        latitude: -34.6,
        longitude: -58.4,
        hourly_price: 100,
        capacity: 5,
        amenities: [],
        photos: undefined as unknown as string[],
      },
    } as ReturnType<typeof roomSchema.safeParse>);
    await expect(createRoom({}, form({}))).rejects.toThrow(
      /^NEXT_REDIRECT:\/rooms\/sunset-studio-/
    );
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({ photos: [] })
    );
    spy.mockRestore();
  });
});
