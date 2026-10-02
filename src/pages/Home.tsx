import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// The animated landing page lives as a standalone file in public/landing.html.
// It ships its own global styles (no-scroll body, custom fonts, etc.), so it is
// embedded in a full-screen iframe to keep those styles away from the rest of
// the React app (Privacy, Terms, Delete Account).
const LANDING_SRC = `${import.meta.env.BASE_URL}landing.html`;

export default function Home() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "SplitPe | हिसाब भी, दोस्ती भी";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Forward the hash (e.g. /#upcoming) so deep links open the right panel.
  const { hash } = useLocation();

  return (
    <iframe
      src={LANDING_SRC + hash}
      title="SplitPe — split bills, keep friends"
      className="fixed inset-0 h-[100dvh] w-full border-0"
    />
  );
}
