jest.mock("@/app/actions/contracts", () => ({ createContract: jest.fn() }));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { render, screen, userEvent, waitFor } from "@test/render";
import { createContract } from "@/app/actions/contracts";
import { toast } from "sonner";
import { ContractDialog } from "./contract-dialog";

const createContractMock = createContract as jest.Mock;
const toastSuccessMock = toast.success as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

async function openDialog() {
  const user = userEvent.setup();
  render(<ContractDialog musicianId="u2" musicianName="Ada Lovelace" />);
  await user.click(screen.getByRole("button", { name: /Contract Ada/i }));
  return user;
}

describe("ContractDialog", () => {
  it("opens the dialog from the trigger", async () => {
    await openDialog();

    expect(
      await screen.findByRole("heading", { name: /Send a contract offer/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/can accept or decline/i)).toBeInTheDocument();
  });

  it("toasts and closes the dialog on a successful submission", async () => {
    createContractMock.mockResolvedValue({ ok: true });
    const user = await openDialog();

    await user.type(screen.getByLabelText("Title"), "Gig at Niceto");
    await user.click(screen.getByRole("button", { name: /Send offer/i }));

    await waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith(
        "Offer sent to Ada Lovelace!"
      )
    );
    // Dialog closes → title heading is gone.
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /Send a contract offer/i })
      ).not.toBeInTheDocument()
    );
  });

  it("surfaces field and form errors when the action is not ok", async () => {
    createContractMock.mockResolvedValue({
      error: "Something went wrong",
      fieldErrors: { title: ["Required"] },
    });
    const user = await openDialog();

    await user.type(screen.getByLabelText("Title"), "x");
    await user.click(screen.getByRole("button", { name: /Send offer/i }));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(toastSuccessMock).not.toHaveBeenCalled();
    // Dialog stays open.
    expect(
      screen.getByRole("heading", { name: /Send a contract offer/i })
    ).toBeInTheDocument();
  });
});
