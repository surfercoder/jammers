import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Banknote } from "lucide-react";
import { requireProfile } from "@/lib/data/auth";
import { getIncomingContracts, getOutgoingContracts } from "@/lib/data/requests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { RequestActions } from "@/components/request-actions";
import { formatMoney, initials } from "@/lib/format";
import type { ContractWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Contracts" };

function ContractItem({
  contract,
  direction,
}: {
  contract: ContractWithRelations;
  direction: "incoming" | "outgoing";
}) {
  const other = direction === "incoming" ? contract.requester : contract.musician;
  return (
    <div className="bg-card space-y-3 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{contract.title}</h3>
            <StatusBadge status={contract.status} />
          </div>
          {contract.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {contract.description}
            </p>
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
        {contract.event_date && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(contract.event_date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
        {contract.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {contract.venue}
            {contract.city ? `, ${contract.city}` : ""}
          </span>
        )}
        {contract.budget != null && (
          <span className="text-foreground flex items-center gap-1 font-medium">
            <Banknote className="size-3.5" /> {formatMoney(contract.budget, contract.currency)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        {other && (
          <Link
            href={`/musicians/${other.username}`}
            className="flex items-center gap-2 hover:underline"
          >
            <Avatar className="size-7">
              <AvatarImage src={other.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {initials(other.full_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {direction === "incoming" ? "From " : "To "}
              {other.full_name ?? other.username}
            </span>
          </Link>
        )}
        <RequestActions id={contract.id} kind="contract" direction={direction} status={contract.status} />
      </div>
    </div>
  );
}

export default async function ContractsPage() {
  const profile = await requireProfile();
  const [incoming, outgoing] = await Promise.all([
    getIncomingContracts(profile.id),
    getOutgoingContracts(profile.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Contracts</h1>
      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">Offers for me ({incoming.length})</TabsTrigger>
          <TabsTrigger value="outgoing">Offers I sent ({outgoing.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-4 space-y-3">
          {incoming.length === 0 ? (
            <Empty message="No gig offers yet. Complete your profile to get discovered." href="/profile" cta="Edit profile" />
          ) : (
            incoming.map((c) => <ContractItem key={c.id} contract={c} direction="incoming" />)
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4 space-y-3">
          {outgoing.length === 0 ? (
            <Empty message="You haven't sent any offers yet." href="/musicians" cta="Find musicians" />
          ) : (
            outgoing.map((c) => <ContractItem key={c.id} contract={c} direction="outgoing" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <div className="text-muted-foreground grid place-items-center rounded-2xl border border-dashed py-16 text-center">
      <p>{message}</p>
      <Link href={href} className="text-primary mt-2 text-sm font-medium hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
