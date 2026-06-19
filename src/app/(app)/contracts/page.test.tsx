import { screen } from "@testing-library/react";
import { renderAsync, userEvent } from "@test/render";
import type { ContractWithRelations } from "@/lib/types";

jest.mock("@/lib/data/auth", () => ({ requireProfile: jest.fn() }));
jest.mock("@/lib/data/requests", () => ({
  getIncomingContracts: jest.fn(),
  getOutgoingContracts: jest.fn(),
}));

import { requireProfile } from "@/lib/data/auth";
import {
  getIncomingContracts,
  getOutgoingContracts,
} from "@/lib/data/requests";
import ContractsPage from "./page";

const requireProfileMock = requireProfile as jest.MockedFunction<
  typeof requireProfile
>;
const incomingMock = getIncomingContracts as jest.MockedFunction<
  typeof getIncomingContracts
>;
const outgoingMock = getOutgoingContracts as jest.MockedFunction<
  typeof getOutgoingContracts
>;

const contract = (overrides: Partial<ContractWithRelations> = {}) =>
  ({
    id: "c1",
    title: "Jazz night",
    status: "pending",
    description: "A cozy gig",
    event_date: "2026-07-01T18:00:00.000Z",
    venue: "Club Z",
    city: "Buenos Aires",
    budget: 50000,
    currency: "ARS",
    requester: {
      full_name: "Ada Lovelace",
      username: "ada",
      avatar_url: "https://img.test/a.jpg",
    },
    musician: {
      full_name: "Bob Marley",
      username: "bob",
      avatar_url: null,
    },
    ...overrides,
  }) as unknown as ContractWithRelations;

beforeEach(() => {
  jest.clearAllMocks();
  requireProfileMock.mockResolvedValue({ id: "u1" } as never);
});

it("renders empty states when there are no contracts", async () => {
  incomingMock.mockResolvedValue([]);
  outgoingMock.mockResolvedValue([]);

  await renderAsync(ContractsPage());

  expect(
    screen.getByRole("heading", { name: "Contracts" })
  ).toBeInTheDocument();
  expect(screen.getByText(/No gig offers yet/i)).toBeInTheDocument();
});

it("renders incoming contract items with all optional fields present", async () => {
  incomingMock.mockResolvedValue([contract({ id: "in1" })]);
  outgoingMock.mockResolvedValue([]);

  await renderAsync(ContractsPage());

  expect(screen.getByText("Jazz night")).toBeInTheDocument();
  expect(screen.getByText("A cozy gig")).toBeInTheDocument();
  expect(screen.getByText("Club Z, Buenos Aires")).toBeInTheDocument();
  expect(screen.getByText(/From Ada Lovelace/i)).toBeInTheDocument();
});

it("renders incoming items with missing optional fields and the username fallback", async () => {
  incomingMock.mockResolvedValue([
    contract({
      id: "in2",
      description: null,
      event_date: null,
      venue: null,
      city: null,
      budget: null,
      // full_name null exercises the `?? username` fallback;
      // avatar_url null exercises `avatar_url ?? undefined`.
      requester: { full_name: null, username: "ada", avatar_url: null } as never,
    }),
    // No requester exercises the `&& other` false branch.
    contract({ id: "in3", requester: null as never }),
  ]);
  outgoingMock.mockResolvedValue([]);

  await renderAsync(ContractsPage());

  expect(screen.getByText(/From ada/i)).toBeInTheDocument();
});

it("renders the venue without a city when city is absent", async () => {
  incomingMock.mockResolvedValue([
    contract({ id: "in4", city: null }),
  ]);
  outgoingMock.mockResolvedValue([]);

  await renderAsync(ContractsPage());

  expect(screen.getByText("Club Z")).toBeInTheDocument();
});

it("renders outgoing items via the musician relation after switching tabs", async () => {
  incomingMock.mockResolvedValue([]);
  outgoingMock.mockResolvedValue([contract({ id: "out1" })]);

  await renderAsync(ContractsPage());
  await userEvent.click(screen.getByRole("tab", { name: /Offers I sent/i }));

  expect(screen.getByText(/To Bob Marley/i)).toBeInTheDocument();
});
