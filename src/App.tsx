import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// Components
import Navbar from "./components/Navbar";
import CompleteProfileModal from "./components/CompleteProfileModal";

// Pages
import Home from "./pages/Home";
import About from "./pages/About.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import AuthCallback from "./pages/AuthCallback";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import { useUser } from "./hooks/useAuth";
import { useUserProfile } from "./hooks/useUserProfile";

// Renders a blocking modal for any signed-in user whose fname/lname are not
// yet set. Suppressed on /auth/callback so the callback can finish its own
// redirect before we prompt.
const ProfileCompletionGate = () => {
  const { user, isLoaded } = useUser();
  const { profile, loading, updateName } = useUserProfile(user?.id ?? null);
  const location = useLocation();

  if (!isLoaded || !user || loading || !profile) return null;
  if (location.pathname.startsWith("/auth/callback")) return null;

  const needsName = !profile.fname?.trim() || !profile.lname?.trim();
  if (!needsName) return null;

  return (
    <CompleteProfileModal
      profile={profile}
      onSubmit={async (fname, lname) => {
        await updateName(fname, lname);
      }}
    />
  );
};
// import PlayerCard from "./pages/PlayerCard.tsx";
// import { Root } from "postcss";

const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 102, 187, 0.4);  /* darker neon-blue with opacity */
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 153, 187, 0.6);
  }
`;

function App() {
  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <ProfileCompletionGate />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/about" element={<About />} />
            <Route path="/home" element={<Home />} />
            {/* <Route path="/brackets" element={<Brackets />} />
            <Route path="/match/:id" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route path="/information" element={<Information />} />
            <Route path="/leaderboard" element={<Leaderboard />} /> */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="*" element={<Navigate to="/home" />} />
            {/* <Route path="/admin" element={<AdminPanel />} /> */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/rootAdmin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
