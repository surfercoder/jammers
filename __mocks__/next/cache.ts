// Automatic mock for next/cache — cache invalidation is a no-op in unit tests.
export const revalidatePath = jest.fn();
export const revalidateTag = jest.fn();
export const unstable_cache = jest.fn(
  <T extends (...args: never[]) => unknown>(fn: T) => fn
);
export const unstable_noStore = jest.fn();
