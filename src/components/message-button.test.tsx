jest.mock("@/app/actions/messages", () => ({
  startConversation: jest.fn(),
}));

import { render, screen, userEvent } from "@test/render";
import { startConversation } from "@/app/actions/messages";
import { MessageButton } from "./message-button";

const startConversationMock = startConversation as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MessageButton", () => {
  it("renders the default label and a full-width submit button", () => {
    render(<MessageButton targetId="u1" />);

    expect(
      screen.getByRole("button", { name: /message/i })
    ).toBeInTheDocument();
  });

  it("renders a custom label, variant and className wrapper", () => {
    const { container } = render(
      <MessageButton
        targetId="u1"
        label="Contact"
        variant="secondary"
        className="wrap"
      />
    );

    expect(screen.getByRole("button", { name: /contact/i })).toBeInTheDocument();
    expect(container.querySelector("form.wrap")).toBeInTheDocument();
  });

  it("submits the bound startConversation action on click", async () => {
    render(<MessageButton targetId="u1" />);

    await userEvent.click(screen.getByRole("button", { name: /message/i }));

    expect(startConversationMock).toHaveBeenCalled();
  });
});
