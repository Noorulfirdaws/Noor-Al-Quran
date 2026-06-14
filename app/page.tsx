import Navbar from "./components/Navbar";
import HeroPricing from "./components/HeroPricing";
import StatsBar from "./components/StatsBar";
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
      <HeroPricing />
      <StatsBar />
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
