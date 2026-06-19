// Automatic mock for next/navigation (applied to every test).
//
// `redirect` and `notFound` throw in real Next.js to halt rendering; we mirror
// that so code after them doesn't run. Tests can assert on the calls and catch
// the thrown sentinel errors. Client hooks return overridable defaults.

export class RedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.name = "RedirectError";
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export const redirect = jest.fn((url: string) => {
  throw new RedirectError(url);
});

export const permanentRedirect = jest.fn((url: string) => {
  throw new RedirectError(url);
});

export const notFound = jest.fn(() => {
  throw new NotFoundError();
});

export const refresh = jest.fn();
export const back = jest.fn();
export const forward = jest.fn();
export const push = jest.fn();
export const replace = jest.fn();
export const prefetch = jest.fn();

export const useRouter = jest.fn(() => ({
  push,
  replace,
  refresh,
  back,
  forward,
  prefetch,
}));

export const usePathname = jest.fn(() => "/");
export const useSearchParams = jest.fn(() => new URLSearchParams());
export const useParams = jest.fn(() => ({}));
export const useSelectedLayoutSegment = jest.fn(() => null);
export const useSelectedLayoutSegments = jest.fn(() => []);
export const useServerInsertedHTML = jest.fn();
