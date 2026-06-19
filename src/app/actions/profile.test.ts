import { createSupabaseMock, createQuery } from "@test/supabase";
import { revalidatePath } from "next/cache";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import { updateProfile, addMedia, deleteMedia } from "./profile";

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

beforeEach(() => {
  jest.clearAllMocks();
});

// Optional profile fields are `string | ""`, never null — the real form posts
// empty strings, so provide them here to exercise the `|| null` fallbacks.
const emptyProfileExtras = {
  headline: "",
  city: "",
  bio: "",
  avatar_url: "",
};

describe("updateProfile", () => {
  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(
      updateProfile({}, form({ full_name: "Ada Lovelace" }))
    ).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("returns field errors for an invalid profile", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await updateProfile({}, form({ full_name: "a" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("surfaces a Supabase profile update error", async () => {
    const from = (table: string) =>
      table === "profiles"
        ? createQuery({ data: null, error: { message: "denied" } })
        : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await updateProfile(
      {},
      form({ full_name: "Ada Lovelace", ...emptyProfileExtras })
    );
    expect(res.error).toBe("denied");
  });

  it("updates a plain profile (no musician) with null fallbacks", async () => {
    const profilesQuery = createQuery({ data: null, error: null });
    const from = (table: string) =>
      table === "profiles" ? profilesQuery : createQuery();
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    const res = await updateProfile(
      {},
      form({ full_name: "Ada Lovelace", ...emptyProfileExtras })
    );
    expect(profilesQuery.update).toHaveBeenCalledWith({
      full_name: "Ada Lovelace",
      headline: null,
      city: null,
      bio: null,
      avatar_url: null,
    });
    expect(profilesQuery.eq).toHaveBeenCalledWith("id", "u1");
    expect(revalidatePath).toHaveBeenCalledWith("/profile");
    expect(revalidatePath).toHaveBeenCalledWith("/musicians", "layout");
    expect(res).toEqual({ ok: true });
  });

  it("keeps provided profile fields instead of null", async () => {
    const profilesQuery = createQuery({ data: null, error: null });
    const from = (table: string) =>
      table === "profiles" ? profilesQuery : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await updateProfile(
      {},
      form({
        full_name: "Ada Lovelace",
        headline: "Engineer",
        city: "London",
        bio: "Hello",
        avatar_url: "https://example.com/a.png",
      })
    );
    expect(profilesQuery.update).toHaveBeenCalledWith({
      full_name: "Ada Lovelace",
      headline: "Engineer",
      city: "London",
      bio: "Hello",
      avatar_url: "https://example.com/a.png",
    });
  });

  it("returns field errors for an invalid musician extension", async () => {
    const from = (table: string) =>
      table === "profiles" ? createQuery({ data: null, error: null }) : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await updateProfile(
      {},
      form({
        full_name: "Ada Lovelace",
        ...emptyProfileExtras,
        has_musician: "1",
        experience_level: "wizard",
      })
    );
    expect(res.fieldErrors).toBeDefined();
  });

  it("surfaces a Supabase musician upsert error", async () => {
    const from = (table: string) => {
      if (table === "profiles") return createQuery({ data: null, error: null });
      if (table === "musician_profiles") {
        return createQuery({ data: null, error: { message: "mboom" } });
      }
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await updateProfile(
      {},
      form({
        full_name: "Ada Lovelace",
        ...emptyProfileExtras,
        has_musician: "1",
        experience_level: "professional",
      })
    );
    expect(res.error).toBe("mboom");
  });

  it("upserts the musician profile with provided rates and open_to_work", async () => {
    const musicianQuery = createQuery({ data: null, error: null });
    const from = (table: string) => {
      if (table === "profiles") return createQuery({ data: null, error: null });
      if (table === "musician_profiles") return musicianQuery;
      return createQuery();
    };
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    const res = await updateProfile(
      {},
      form({
        full_name: "Ada Lovelace",
        ...emptyProfileExtras,
        has_musician: "1",
        experience_level: "professional",
        genres: ["rock", "jazz"],
        instruments: ["guitar"],
        available_for: ["gigs"],
        hourly_rate: "120",
        years_experience: "10",
        open_to_work: "on",
      })
    );
    expect(musicianQuery.upsert).toHaveBeenCalledWith(
      {
        profile_id: "u1",
        genres: ["rock", "jazz"],
        instruments: ["guitar"],
        experience_level: "professional",
        available_for: ["gigs"],
        hourly_rate: 120,
        years_experience: 10,
        open_to_work: true,
      },
      { onConflict: "profile_id" }
    );
    expect(res).toEqual({ ok: true });
  });

  it("upserts with null rates when omitted and open_to_work false", async () => {
    const musicianQuery = createQuery({ data: null, error: null });
    const from = (table: string) => {
      if (table === "profiles") return createQuery({ data: null, error: null });
      if (table === "musician_profiles") return musicianQuery;
      return createQuery();
    };
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await updateProfile(
      {},
      form({
        full_name: "Ada Lovelace",
        ...emptyProfileExtras,
        has_musician: "1",
        experience_level: "beginner",
      })
    );
    expect(musicianQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        hourly_rate: null,
        years_experience: null,
        open_to_work: false,
      }),
      { onConflict: "profile_id" }
    );
  });
});

describe("addMedia", () => {
  it("returns an error when no url is provided", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await addMedia({}, form({ url: "   " }));
    expect(res).toEqual({ error: "Add a video URL." });
  });

  it("returns an error when url field is missing entirely", async () => {
    useClient(createSupabaseMock({ user: { id: "u1" } }));
    const res = await addMedia({}, form({}));
    expect(res).toEqual({ error: "Add a video URL." });
  });

  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(
      addMedia({}, form({ url: "https://youtu.be/abc" }))
    ).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("surfaces a Supabase insert error", async () => {
    const from = (table: string) =>
      table === "media"
        ? createQuery({ data: null, error: { message: "mediaboom" } })
        : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    const res = await addMedia({}, form({ url: "https://youtu.be/abc" }));
    expect(res).toEqual({ error: "mediaboom" });
  });

  it("inserts media with a null title fallback", async () => {
    const mediaQuery = createQuery({ data: null, error: null });
    const from = (table: string) =>
      table === "media" ? mediaQuery : createQuery();
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    const res = await addMedia({}, form({ url: "https://youtu.be/abc" }));
    expect(mediaQuery.insert).toHaveBeenCalledWith({
      profile_id: "u1",
      type: "video",
      url: "https://youtu.be/abc",
      title: null,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/profile");
    expect(res).toEqual({ ok: true });
  });

  it("inserts media with a provided title", async () => {
    const mediaQuery = createQuery({ data: null, error: null });
    const from = (table: string) =>
      table === "media" ? mediaQuery : createQuery();
    useClient(createSupabaseMock({ user: { id: "u1" }, from }));
    await addMedia(
      {},
      form({ url: " https://youtu.be/abc ", title: "  My clip  " })
    );
    expect(mediaQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://youtu.be/abc", title: "My clip" })
    );
  });
});

describe("deleteMedia", () => {
  it("redirects to /sign-in when there is no user", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(deleteMedia("m1")).rejects.toThrow("NEXT_REDIRECT:/sign-in");
  });

  it("deletes media scoped to the user and revalidates", async () => {
    const mediaQuery = createQuery({ data: null, error: null });
    const from = (table: string) =>
      table === "media" ? mediaQuery : createQuery();
    const supabase = createSupabaseMock({ user: { id: "u1" }, from });
    useClient(supabase);
    const res = await deleteMedia("m1");
    expect(mediaQuery.delete).toHaveBeenCalled();
    expect(mediaQuery.eq).toHaveBeenCalledWith("id", "m1");
    expect(mediaQuery.eq).toHaveBeenCalledWith("profile_id", "u1");
    expect(revalidatePath).toHaveBeenCalledWith("/profile");
    expect(res).toEqual({ ok: true });
  });
});
