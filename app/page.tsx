import Navbar from "./components/Navbar";
import HeroPricing from "./components/HeroPricing";
import StatsBar from "./components/StatsBar";
import AIFeatureProof from "./components/AIFeatureProof";
import PricingCards from "./components/PricingCards";
import PremiumFeatures from "./components/PremiumFeatures";
import SocialProof from "./components/SocialProof";
import VideoCarousel from "./components/VideoCarousel";
import FeatureComparison from "./components/FeatureComparison";
import GiftCards from "./components/GiftCards";
import BlogSection from "./components/BlogSection";
import BookShelf from "./components/BookShelf";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      {/* Anchor for the "Features" nav link so it returns to the top hero. */}
      <div id="top" aria-hidden />
      <HeroPricing />
      <StatsBar />
      <AIFeatureProof />
      <PremiumFeatures />
      <SocialProof />
      <PricingCards />
      <VideoCarousel />
      <FeatureComparison />
      <GiftCards />
      <BlogSection />
      <BookShelf />
      <FAQ />
      <Footer />
    </main>
  );
}
