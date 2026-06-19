import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">
      <HeroSection />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
