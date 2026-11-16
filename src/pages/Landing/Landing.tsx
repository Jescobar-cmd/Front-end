import { LandingNavbar } from "./components/LandingNavbar";
import { Hero } from "./components/Hero";
import { TrustBar } from "./components/TrustBar";
import { Categories } from "./components/Categories";
import { PopularServices } from "./components/PopularServices";
import { HowItWorks } from "./components/HowItWorks";
import { FinalCTA } from "./components/FinalCTA";
import { LandingFooter } from "./components/LandingFooter";
import "../../styles/landing.css";

export function Landing() {
  return (
    <div className="landing">
      <a className="landing-skip" href="#landing-main">Saltar al contenido</a>
      <LandingNavbar />
      <main id="landing-main">
        <Hero />
        <TrustBar />
        <Categories />
        <PopularServices />
        <HowItWorks />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
