import {
  signUpSchema,
  signInSchema,
  emailSchema,
  passwordSchema,
  profileSchema,
  musicianSchema,
  roomSchema,
  bookingSchema,
  contractSchema,
  reviewSchema,
} from "./validations";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("signUpSchema", () => {
  it("accepts a valid sign up", () => {
    expect(
      signUpSchema.safeParse({
        full_name: "Ada Lovelace",
        username: "ada_99",
        email: "ada@example.com",
        password: "supersecret",
        account_type: "musician",
      }).success
    ).toBe(true);
  });

  it("rejects every invalid field", () => {
    const r = signUpSchema.safeParse({
      full_name: "A",
      username: "ad",
      email: "nope",
      password: "short",
      account_type: "alien",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a username with illegal characters", () => {
    const r = signUpSchema.safeParse({
      full_name: "Ada Lovelace",
      username: "ada lovelace!",
      email: "ada@example.com",
      password: "supersecret",
      account_type: "manager",
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.message.includes("underscores"))).toBe(
      true
    );
  });
});

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
  });

  it("rejects an empty password and bad email", () => {
    expect(
      signInSchema.safeParse({ email: "bad", password: "" }).success
    ).toBe(false);
  });
});

describe("emailSchema", () => {
  it("accepts a valid email and rejects an invalid one", () => {
    expect(emailSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(emailSchema.safeParse({ email: "bad" }).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts >=8 chars and rejects shorter", () => {
    expect(passwordSchema.safeParse({ password: "12345678" }).success).toBe(
      true
    );
    expect(passwordSchema.safeParse({ password: "1234" }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts populated optional fields", () => {
    expect(
      profileSchema.safeParse({
        full_name: "Ada Lovelace",
        headline: "Composer",
        city: "Buenos Aires",
        bio: "Hello",
        avatar_url: "https://example.com/a.png",
      }).success
    ).toBe(true);
  });

  it("accepts empty-string literal branches for optionals", () => {
    expect(
      profileSchema.safeParse({
        full_name: "Ada Lovelace",
        headline: "",
        city: "",
        bio: "",
        avatar_url: "",
      }).success
    ).toBe(true);
  });

  it("accepts omitted optionals", () => {
    expect(
      profileSchema.safeParse({ full_name: "Ada Lovelace" }).success
    ).toBe(true);
  });

  it("rejects a too-short name and invalid avatar url", () => {
    expect(
      profileSchema.safeParse({
        full_name: "A",
        avatar_url: "not-a-url",
      }).success
    ).toBe(false);
  });
});

describe("musicianSchema", () => {
  it("accepts a full valid payload with coercion", () => {
    const r = musicianSchema.safeParse({
      genres: ["Rock"],
      instruments: ["Bass"],
      experience_level: "professional",
      available_for: ["gigs"],
      hourly_rate: "500",
      years_experience: "10",
      open_to_work: false,
    });
    expect(r.success).toBe(true);
    expect(r.data?.hourly_rate).toBe(500);
  });

  it("applies the open_to_work default and skips optional numbers", () => {
    const r = musicianSchema.safeParse({
      genres: [],
      instruments: [],
      experience_level: "beginner",
      available_for: [],
    });
    expect(r.success).toBe(true);
    expect(r.data?.open_to_work).toBe(true);
  });

  it("rejects too many genres, bad level and out-of-range rate", () => {
    expect(
      musicianSchema.safeParse({
        genres: new Array(13).fill("X"),
        instruments: [],
        experience_level: "guru",
        available_for: [],
        hourly_rate: -1,
      }).success
    ).toBe(false);
  });
});

describe("roomSchema", () => {
  it("accepts a valid room with optionals", () => {
    expect(
      roomSchema.safeParse({
        name: "Studio A",
        description: "Nice",
        neighborhood: "Palermo",
        address: "Street 1",
        latitude: "-34.6",
        longitude: "-58.4",
        hourly_price: "1000",
        capacity: "5",
        amenities: ["wifi"],
        photos: ["https://example.com/p.png"],
      }).success
    ).toBe(true);
  });

  it("accepts empty-string optionals", () => {
    expect(
      roomSchema.safeParse({
        name: "Studio A",
        description: "",
        neighborhood: "Palermo",
        address: "",
        latitude: 0,
        longitude: 0,
        hourly_price: 0,
        capacity: 1,
        amenities: [],
        photos: [],
      }).success
    ).toBe(true);
  });

  it("rejects invalid coordinates, capacity, photos and missing neighborhood", () => {
    expect(
      roomSchema.safeParse({
        name: "ab",
        neighborhood: "",
        latitude: 200,
        longitude: 200,
        hourly_price: -5,
        capacity: 0,
        amenities: [],
        photos: ["not-a-url"],
      }).success
    ).toBe(false);
  });
});

describe("bookingSchema", () => {
  it("accepts a valid booking with and without notes", () => {
    expect(
      bookingSchema.safeParse({
        room_id: UUID,
        date: "2026-06-20",
        start: "18:00",
        hours: "3",
        notes: "Bring drums",
      }).success
    ).toBe(true);
    expect(
      bookingSchema.safeParse({
        room_id: UUID,
        date: "2026-06-20",
        start: "18:00",
        hours: 3,
        notes: "",
      }).success
    ).toBe(true);
  });

  it("rejects bad uuid, empty date/start and out-of-range hours", () => {
    expect(
      bookingSchema.safeParse({
        room_id: "nope",
        date: "",
        start: "",
        hours: 99,
      }).success
    ).toBe(false);
  });
});

describe("contractSchema", () => {
  it("accepts a valid contract with optionals populated", () => {
    expect(
      contractSchema.safeParse({
        musician_id: UUID,
        title: "Need a guitarist",
        description: "desc",
        event_date: "2026-07-01",
        venue: "Club",
        city: "BA",
        budget: "5000",
      }).success
    ).toBe(true);
  });

  it("accepts empty-string optionals and omitted budget", () => {
    expect(
      contractSchema.safeParse({
        musician_id: UUID,
        title: "Need a guitarist",
        description: "",
        event_date: "",
        venue: "",
        city: "",
      }).success
    ).toBe(true);
  });

  it("rejects bad uuid, short title and over-budget", () => {
    expect(
      contractSchema.safeParse({
        musician_id: "nope",
        title: "hi",
        budget: 999_999_999,
      }).success
    ).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("accepts a valid review with and without comment", () => {
    expect(
      reviewSchema.safeParse({
        room_id: UUID,
        rating: "5",
        comment: "Great",
      }).success
    ).toBe(true);
    expect(
      reviewSchema.safeParse({ room_id: UUID, rating: 3, comment: "" }).success
    ).toBe(true);
  });

  it("rejects bad uuid and out-of-range rating", () => {
    expect(
      reviewSchema.safeParse({ room_id: "nope", rating: 9 }).success
    ).toBe(false);
  });
});
