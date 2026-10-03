import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Ambient from "../components/landing/Ambient";
import IconSprite from "../components/landing/IconSprite";
import LandingHeader from "../components/landing/LandingHeader";
import Loader from "../components/landing/Loader";
import Hero from "../components/landing/hero/Hero";
import DownloadCta from "../components/landing/sections/DownloadCta";
import Faq from "../components/landing/sections/Faq";
import Features from "../components/landing/sections/Features";
import HowItWorks from "../components/landing/sections/HowItWorks";
import Upcoming from "../components/landing/sections/Upcoming";
import useLandingAnimations from "../components/landing/useLandingAnimations";
import "../components/landing/styles/index.css";

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  useLandingAnimations(root);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "SplitPe | हिसाब भी, दोस्ती भी";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Footer links like /#faq change only the hash — scroll to that section.
  // (The first load is handled after the intro, in useLandingAnimations.)
  const { hash } = useLocation();
  const firstHash = useRef(true);
  useEffect(() => {
    if (firstHash.current) {
      firstHash.current = false;
      return;
    }
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="landing" ref={root}>
      <IconSprite />
      <Loader />
      <Ambient />
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Upcoming />
        <Faq />
        <DownloadCta />
      </main>
      <div className="landing-footer">
        <Footer />
      </div>
    </div>
  );
}
