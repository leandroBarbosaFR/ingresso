import { CollectionsSection } from "@/components/site/collections-section";
import { Hero } from "@/components/site/hero";
import { PopularSection } from "@/components/site/popular-section";

export default function Home() {
  return (
    <>
      <Hero />
      <CollectionsSection />
      <PopularSection />
    </>
  );
}
