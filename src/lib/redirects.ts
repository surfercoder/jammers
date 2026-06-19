/**
 * Reduce an untrusted `next` redirect parameter to a safe in-app path.
 *
 * Only a single-slash-rooted relative path is allowed (so `//evil.com` and
 * `https://evil.com` open redirects are rejected); anything else falls back to
 * the explore page. Used by the auth server actions and the auth route
 * handlers, which all read `next` from attacker-controllable input.
 */
export function safeNext(next: string | null | undefined): string {
  return next && /^\/(?!\/)/.test(next) ? next : "/explore";
}
