import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SiteBackground from "./components/SiteBackground";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import DeleteAccount from "./pages/DeleteAccount";

// Loaded only when /admin is opened, so the Firebase SDK and the admin
// screens never ship with the public site.
const AdminApp = lazy(() => import("./admin/AdminApp"));

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

// A new page starts at the top (links to /#section scroll themselves).
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function Layout() {
  const { pathname } = useLocation();
  // The home route is the landing page, which brings its own header, backdrop and footer.
  const isLanding = pathname === "/";
  // The admin panel brings its own full-screen layout.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const bareLayout = isLanding || isAdmin;

  return (
    <div className="flex min-h-screen flex-col text-slate-900">
      {!bareLayout && <SiteBackground />}
      {!bareLayout && <Navbar />}

      <main className="flex-1">
        <RedirectHandler />
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <AdminApp />
              </Suspense>
            }
          />
        </Routes>
      </main>

      {!bareLayout && <Footer />}
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