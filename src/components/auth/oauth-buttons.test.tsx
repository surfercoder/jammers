jest.mock("@/app/actions/auth", () => ({
  signInWithGoogle: jest.fn(),
}));

import { render, screen, userEvent } from "@test/render";
import { signInWithGoogle } from "@/app/actions/auth";
import { OAuthButtons } from "./oauth-buttons";

describe("OAuthButtons", () => {
  it("submits the Google sign-in form action", async () => {
    render(<OAuthButtons />);

    await userEvent.click(
      screen.getByRole("button", { name: /continue with google/i })
    );

    expect(signInWithGoogle).toHaveBeenCalled();
  });
});
