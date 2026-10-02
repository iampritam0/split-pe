import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SiteBackground from "./components/SiteBackground";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import DeleteAccount from "./pages/DeleteAccount";

function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect) {
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
}

function Layout() {
  const { pathname } = useLocation();
  // The home route is the full-screen landing page, which has its own header.
  const isLanding = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col text-slate-900">
      {!isLanding && <SiteBackground />}
      {!isLanding && <Navbar />}

      <main className="flex-1">
        <RedirectHandler />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
        </Routes>
      </main>

      {!isLanding && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Layout />
    </BrowserRouter>
  );
}