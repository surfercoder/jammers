import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaBand({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="bg-brand-gradient relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white">
        <div className="bg-hero-aurora animate-aurora absolute inset-0 opacity-50 mix-blend-soft-light" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Your next rehearsal, gig or bandmate is one click away.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Join the Buenos Aires music community building on Jammers.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 h-12 px-8 text-base"
          >
            <Link href={signedIn ? "/explore" : "/sign-up"}>
              {signedIn ? "Open the app" : "Create your free account"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
        {/* Rendered on the server; the year is stable for the request. */}
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} Jammers. Made for musicians.
        </p>
        <div className="flex gap-5">
          <Link href="/explore" className="hover:text-foreground">Rooms</Link>
          <Link href="/musicians" className="hover:text-foreground">Musicians</Link>
          <Link href="/sign-up" className="hover:text-foreground">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
