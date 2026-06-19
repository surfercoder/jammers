import { render, screen } from "@test/render";
import { FormSuccess } from "./form-success";

describe("FormSuccess", () => {
  it("renders nothing when there is no message", () => {
    const { container } = render(<FormSuccess />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message when provided", () => {
    render(<FormSuccess message="Check your email" />);
    expect(screen.getByText("Check your email")).toBeInTheDocument();
  });
});
