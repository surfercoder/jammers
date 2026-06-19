import { createSupabaseMock, type SupabaseMock } from "@test/supabase";
import { resetNextHeaders, setHeaders } from "@test/next-headers-state";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

jest.mock("@/utils/supabase/server", () => ({ createClient: jest.fn() }));
import { createClient } from "@/utils/supabase/server";
import {
  signUp,
  signIn,
  requestPasswordReset,
  updatePassword,
  signOut,
  signInWithGoogle,
} from "./auth";

const mockedCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

let supabase: SupabaseMock;

function useClient(mock: SupabaseMock) {
  supabase = mock;
  mockedCreateClient.mockResolvedValue(mock as never);
}

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

const validSignUp = {
  full_name: "Ada Lovelace",
  username: "ada",
  email: "ada@example.com",
  password: "supersecret",
  account_type: "musician",
};

beforeEach(() => {
  jest.clearAllMocks();
  resetNextHeaders();
  process.env.NEXT_PUBLIC_SITE_URL = "https://jammers.test";
  useClient(createSupabaseMock({ user: { id: "u1" } }));
});

describe("signUp", () => {
  it("returns field errors for invalid input", async () => {
    const res = await signUp({}, form({ email: "nope" }));
    expect(res.fieldErrors).toBeDefined();
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("creates the account and returns a confirmation message", async () => {
    const res = await signUp({}, form(validSignUp));
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com" })
    );
    expect(res.message).toMatch(/check your inbox/i);
  });

  it("surfaces a Supabase error", async () => {
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "taken" },
    });
    const res = await signUp({}, form(validSignUp));
    expect(res.error).toBe("taken");
  });
});

describe("siteOrigin fallbacks (via signUp)", () => {
  it("falls back to the origin header when no env URL", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    setHeaders({ origin: "https://from-header.test" });
    await signUp({}, form(validSignUp));
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "https://from-header.test/auth/confirm?next=/explore",
        }),
      })
    );
  });

  it("falls back to the host header when no env URL or origin", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    setHeaders({ host: "host.test" });
    await signUp({}, form(validSignUp));
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "https://host.test/auth/confirm?next=/explore",
        }),
      })
    );
  });
});

describe("signIn", () => {
  it("returns field errors for invalid input", async () => {
    const res = await signIn({}, form({ email: "bad" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("surfaces a Supabase error", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "invalid" },
    });
    const res = await signIn(
      {},
      form({ email: "ada@example.com", password: "supersecret" })
    );
    expect(res.error).toBe("invalid");
  });

  it("redirects to a safe next path on success", async () => {
    await expect(
      signIn(
        {},
        form({ email: "ada@example.com", password: "supersecret", next: "/host" })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/host");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("rejects an unsafe next path and defaults to /explore", async () => {
    await expect(
      signIn(
        {},
        form({
          email: "ada@example.com",
          password: "supersecret",
          next: "https://evil.test",
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/explore");
    expect(redirect).toHaveBeenCalledWith("/explore");
  });
});

describe("requestPasswordReset", () => {
  it("returns field errors for invalid input", async () => {
    const res = await requestPasswordReset({}, form({ email: "bad" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("sends a reset email and returns a neutral message", async () => {
    const res = await requestPasswordReset(
      {},
      form({ email: "ada@example.com" })
    );
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled();
    expect(res.message).toMatch(/reset link/i);
  });

  it("surfaces a Supabase error", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
      error: { message: "rate limited" },
    });
    const res = await requestPasswordReset(
      {},
      form({ email: "ada@example.com" })
    );
    expect(res.error).toBe("rate limited");
  });
});

describe("updatePassword", () => {
  it("returns field errors for invalid input", async () => {
    const res = await updatePassword({}, form({ password: "short" }));
    expect(res.fieldErrors).toBeDefined();
  });

  it("rejects when the recovery session has expired", async () => {
    useClient(createSupabaseMock({ user: null }));
    const res = await updatePassword({}, form({ password: "supersecret" }));
    expect(res.error).toMatch(/expired/i);
  });

  it("surfaces a Supabase error", async () => {
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "weak" },
    });
    const res = await updatePassword({}, form({ password: "supersecret" }));
    expect(res.error).toBe("weak");
  });

  it("redirects to /explore on success", async () => {
    await expect(
      updatePassword({}, form({ password: "supersecret" }))
    ).rejects.toThrow("NEXT_REDIRECT:/explore");
  });
});

describe("signOut", () => {
  it("signs out when there is a user, then redirects home", async () => {
    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("skips signing out when there is no session", async () => {
    useClient(createSupabaseMock({ user: null }));
    await expect(signOut()).rejects.toThrow("NEXT_REDIRECT:/");
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });
});

describe("signInWithGoogle", () => {
  it("redirects to the provider URL", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { url: "https://accounts.google.test/o" },
      error: null,
    });
    await expect(signInWithGoogle()).rejects.toThrow(
      "NEXT_REDIRECT:https://accounts.google.test/o"
    );
  });

  it("redirects back to sign-in on OAuth error", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { url: null },
      error: { message: "oauth boom" },
    });
    await expect(signInWithGoogle()).rejects.toThrow(
      "NEXT_REDIRECT:/sign-in?error=oauth%20boom"
    );
  });

  it("no-ops when there is neither a URL nor an error", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { url: null },
      error: null,
    });
    await expect(signInWithGoogle()).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });
});
