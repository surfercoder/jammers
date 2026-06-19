import { render, screen } from "@test/render";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it.each([
    ["pending", "Pending"],
    ["accepted", "Accepted"],
    ["declined", "Declined"],
    ["cancelled", "Cancelled"],
    ["completed", "Completed"],
  ])("renders the %s status with its label", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("falls back to the raw status for unknown values", () => {
    render(<StatusBadge status="mystery" />);
    expect(screen.getByText("mystery")).toBeInTheDocument();
  });
});
