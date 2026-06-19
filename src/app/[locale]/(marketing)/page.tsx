import CallToAction from "@/components/marketing/call-to-action";
import FAQsTwo from "@/components/marketing/faqs";
import Features from "@/components/marketing/features";
import Pricing from "@/components/marketing/pricing";
import Testimonials from "@/components/marketing/testimonials";

export default function Home() {
  return (
    <>
      <Features />
      <Testimonials />
      <Pricing />
      <FAQsTwo />
      <CallToAction />
    </>
  );
}
