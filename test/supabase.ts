// Reusable Supabase client mock for unit tests.
//
// The query builder is chainable (every filter returns itself) and awaitable
// (thenable), and `single()` / `maybeSingle()` resolve too — so it matches the
// `supabase.from("t").select().eq()...` shapes used across the app.

export type SupabaseError = { message: string } | null;
export type SupabaseResult<T = unknown> = { data: T; error: SupabaseError };

const CHAIN_METHODS = [
  "select",
  "insert",
  "update",
  "upsert",
  "delete",
  "eq",
  "neq",
  "in",
  "or",
  "ilike",
  "like",
  "gte",
  "lte",
  "gt",
  "lt",
  "contains",
  "overlaps",
  "order",
  "limit",
  "range",
  "not",
  "match",
  "is",
  "filter",
] as const;

type ChainMethod = (typeof CHAIN_METHODS)[number];

export type QueryMock = PromiseLike<SupabaseResult> &
  Record<ChainMethod | "single" | "maybeSingle", jest.Mock>;

/** Build a chainable query that ultimately resolves to `result`. */
export function createQuery(
  result: SupabaseResult = { data: null, error: null }
): QueryMock {
  const query = {} as QueryMock;
  const settle = () => Promise.resolve(result);

  for (const method of CHAIN_METHODS) {
    query[method] = jest.fn(() => query);
  }
  query.single = jest.fn(settle);
  query.maybeSingle = jest.fn(settle);
  (query as PromiseLike<SupabaseResult>).then = (onfulfilled, onrejected) =>
    settle().then(onfulfilled, onrejected);

  return query;
}

export type MockUser = { id: string; email?: string } | null;

export interface SupabaseMockOptions {
  /** The user returned by `auth.getUser()` (null = signed out). */
  user?: MockUser;
  /** Per-table query factory; defaults to an empty result for every table. */
  from?: (table: string) => QueryMock;
}

export type ChannelMock = {
  on: jest.Mock;
  subscribe: jest.Mock;
  unsubscribe: jest.Mock;
  /** Invoke every registered realtime handler with `payload`. */
  __emit: (payload: unknown) => void;
};

/** A realtime channel that records `.on()` handlers so tests can emit events. */
export function createChannelMock(): ChannelMock {
  const handlers: Array<(payload: unknown) => void> = [];
  const channel: ChannelMock = {
    on: jest.fn(
      (
        _event: string,
        _filter: unknown,
        handler: (payload: unknown) => void
      ) => {
        handlers.push(handler);
        return channel;
      }
    ),
    subscribe: jest.fn(() => channel),
    unsubscribe: jest.fn(),
    __emit: (payload: unknown) => handlers.forEach((h) => h(payload)),
  };
  return channel;
}

/** Create a mock matching the surface of the Supabase JS client used here. */
export function createSupabaseMock(options: SupabaseMockOptions = {}) {
  const { user = null, from } = options;

  const fromFn = jest.fn((table: string) =>
    from ? from(table) : createQuery()
  );

  const channel = createChannelMock();

  type UserResult = { data: { user: MockUser }; error: SupabaseError };
  type ErrorResult = { error: SupabaseError };

  const auth = {
    getUser: jest.fn(
      async (): Promise<UserResult> => ({ data: { user }, error: null })
    ),
    getClaims: jest.fn(
      async (): Promise<{
        data: { claims: { sub: string } } | null;
        error: SupabaseError;
      }> => ({
        data: user ? { claims: { sub: user.id } } : null,
        error: null,
      })
    ),
    signUp: jest.fn(
      async (): Promise<UserResult> => ({ data: { user }, error: null })
    ),
    signInWithPassword: jest.fn(
      async (): Promise<UserResult> => ({ data: { user }, error: null })
    ),
    signInWithOAuth: jest.fn(
      async (): Promise<{
        data: { url: string | null };
        error: SupabaseError;
      }> => ({ data: { url: null }, error: null })
    ),
    resetPasswordForEmail: jest.fn(
      async (): Promise<ErrorResult> => ({ error: null })
    ),
    updateUser: jest.fn(
      async (): Promise<UserResult> => ({ data: { user }, error: null })
    ),
    signOut: jest.fn(async (): Promise<ErrorResult> => ({ error: null })),
    exchangeCodeForSession: jest.fn(
      async (): Promise<ErrorResult> => ({ error: null })
    ),
    verifyOtp: jest.fn(async (): Promise<ErrorResult> => ({ error: null })),
  };

  return {
    from: fromFn,
    auth,
    channel: jest.fn(() => channel),
    removeChannel: jest.fn(),
    /** The realtime channel returned by `channel()`; use `__emit` to push events. */
    __channel: channel,
  };
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>;
