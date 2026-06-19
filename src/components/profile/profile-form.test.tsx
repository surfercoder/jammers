jest.mock("@/app/actions/profile", () => ({
  updateProfile: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

import { render, screen, userEvent, waitFor } from "@test/render";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import type { Profile, MusicianProfile } from "@/lib/types";
import { ProfileForm } from "./profile-form";

const updateProfileMock = updateProfile as jest.Mock;
const toastSuccessMock = toast.success as jest.Mock;

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    account_type: "musician",
    full_name: "Ada Lovelace",
    city: "Buenos Aires",
    headline: "Bassist",
    avatar_url: "https://img.test/a.jpg",
    bio: "Hi",
    ...overrides,
  } as unknown as Profile;
}

function musician(overrides: Partial<MusicianProfile> = {}): MusicianProfile {
  return {
    open_to_work: false,
    instruments: ["Bass"],
    genres: ["Funk"],
    available_for: ["gigs"],
    experience_level: "professional",
    years_experience: 5,
    hourly_rate: 1000,
    ...overrides,
  } as unknown as MusicianProfile;
}

beforeEach(() => {
  jest.clearAllMocks();
  updateProfileMock.mockResolvedValue({});
});

describe("ProfileForm", () => {
  it("renders musician details for a musician account", () => {
    const { container } = render(
      <ProfileForm profile={profile()} musician={musician()} />
    );

    expect(screen.getByText("Musician details")).toBeInTheDocument();
    expect(
      container.querySelector('input[name="has_musician"]')
    ).toHaveValue("1");
    // Existing musician selections render as selected chips (hidden inputs).
    expect(container.querySelector('input[name="instruments"]')).toHaveValue(
      "Bass"
    );
    expect(container.querySelector('input[name="genres"]')).toHaveValue("Funk");
  });

  it("hides musician details for a room owner and uses field fallbacks", () => {
    const { container } = render(
      <ProfileForm
        profile={profile({
          account_type: "room_owner",
          full_name: null,
          city: null,
          headline: null,
          avatar_url: null,
          bio: null,
        })}
        musician={null}
      />
    );

    expect(screen.queryByText("Musician details")).not.toBeInTheDocument();
    expect(
      container.querySelector('input[name="has_musician"]')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("");
  });

  it("defaults musician fields when musician is null but account is a musician", () => {
    const { container } = render(
      <ProfileForm profile={profile()} musician={null} />
    );

    expect(screen.getByText("Musician details")).toBeInTheDocument();
    // No default selections → no chip hidden inputs.
    expect(
      container.querySelector('input[name="instruments"]')
    ).not.toBeInTheDocument();
    // Switch defaults to checked when musician is null.
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toasts when the profile is saved", async () => {
    updateProfileMock.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ProfileForm profile={profile()} musician={musician()} />);

    await user.click(screen.getByRole("button", { name: /Save profile/i }));

    await waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith("Profile saved.")
    );
  });

  it("shows form and field errors when saving fails", async () => {
    updateProfileMock.mockResolvedValue({
      error: "Could not save",
      fieldErrors: { full_name: ["Name is required"] },
    });
    const user = userEvent.setup();
    render(<ProfileForm profile={profile()} musician={musician()} />);

    await user.click(screen.getByRole("button", { name: /Save profile/i }));

    expect(await screen.findByText("Could not save")).toBeInTheDocument();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });
});
