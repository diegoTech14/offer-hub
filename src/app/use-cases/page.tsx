import { ServicePlatformsSection, RealEstateSection } from "@/components/use-cases";

export const metadata = {
  title: "Use Cases | OFFER-HUB",
  description: "Discover how OFFER-HUB powers secure escrow solutions for service platforms, real estate, and more.",
};

export default function UseCasesPage() {
  return (
    <main className="min-h-screen">
      <ServicePlatformsSection />
      <RealEstateSection />
    </main>
  );
}
