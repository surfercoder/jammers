import type { ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";

/**
 * Render an async Server Component. Jest can't render `async` components as
 * children, but we can invoke the component, await its returned element, and
 * render that. Pass the element promise, e.g. `renderAsync(Page({ params }))`.
 */
export async function renderAsync(
  element: Promise<ReactElement>
): Promise<RenderResult> {
  return render(await element);
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
