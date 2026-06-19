import { render, screen } from "@test/render";
import { FieldError } from "./field-error";

describe("FieldError", () => {
  it("renders nothing when there are no errors", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the errors array is empty", () => {
    const { container } = render(<FieldError errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the first error message", () => {
    render(<FieldError errors={["Too short", "Ignored"]} />);
    expect(screen.getByText("Too short")).toBeInTheDocument();
    expect(screen.queryByText("Ignored")).not.toBeInTheDocument();
  });
});
