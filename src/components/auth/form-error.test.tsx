import { render, screen } from "@test/render";
import { FormError } from "./form-error";

describe("FormError", () => {
  it("renders nothing when there is no message", () => {
    const { container } = render(<FormError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message when provided", () => {
    render(<FormError message="Invalid credentials" />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
