// Shared, typed backing state for the next/headers automatic mock. Tests
// import these setters (real, typed module); the mock reads the same state.

export type CookieRecord = { name: string; value: string; options?: unknown };

let cookieStore: CookieRecord[] = [];
let headerMap = new Map<string, string>();

export function setCookies(cookies: CookieRecord[]) {
  cookieStore = [...cookies];
}

export function setHeaders(values: Record<string, string>) {
  headerMap = new Map(
    Object.entries(values).map(([k, v]) => [k.toLowerCase(), v])
  );
}

export function resetNextHeaders() {
  cookieStore = [];
  headerMap = new Map();
}

export function getCookieStore(): CookieRecord[] {
  return cookieStore;
}

export function pushCookie(record: CookieRecord) {
  cookieStore.push(record);
}

export function deleteCookie(name: string) {
  cookieStore = cookieStore.filter((c) => c.name !== name);
}

export function getHeader(name: string): string | null {
  return headerMap.get(name.toLowerCase()) ?? null;
}

export function hasHeader(name: string): boolean {
  return headerMap.has(name.toLowerCase());
}

export function headerEntries(): IterableIterator<[string, string]> {
  return headerMap.entries();
}
