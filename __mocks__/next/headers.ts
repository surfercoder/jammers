// Automatic mock for next/headers. Backing state lives in the typed
// `@test/next-headers-state` module so tests can configure it with full types.
import {
  getCookieStore,
  pushCookie,
  deleteCookie,
  getHeader,
  hasHeader,
  headerEntries,
} from "@test/next-headers-state";

export const cookies = jest.fn(async () => ({
  getAll: () => getCookieStore(),
  get: (name: string) => getCookieStore().find((c) => c.name === name),
  set: jest.fn((name: string, value: string, options?: unknown) => {
    pushCookie({ name, value, options });
  }),
  delete: jest.fn((name: string) => {
    deleteCookie(name);
  }),
}));

export const headers = jest.fn(async () => ({
  get: (name: string) => getHeader(name),
  has: (name: string) => hasHeader(name),
  entries: () => headerEntries(),
}));

export const draftMode = jest.fn(async () => ({
  isEnabled: false,
  enable: jest.fn(),
  disable: jest.fn(),
}));
