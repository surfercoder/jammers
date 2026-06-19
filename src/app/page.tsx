import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { CtaBand, Footer } from "@/components/marketing/cta";
import { getCurrentProfile } from "@/lib/data/auth";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const signedIn = Boolean(profile);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero signedIn={signedIn} />
        <Features />
        <CtaBand signedIn={signedIn} />
      </main>
      <Footer />
    </div>
  );
}
