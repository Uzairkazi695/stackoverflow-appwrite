import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import LatestQuestion from "./components/LatestQuestion";
import TopContributors from "./components/TopContributors";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <LatestQuestion />
      <TopContributors />
      <Footer />
    </>
  );
}
