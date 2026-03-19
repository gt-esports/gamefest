import { Routes, Route, Navigate } from "react-router-dom";
// Components
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Brackets from "./pages/Brackets.tsx";
import Matches from "./pages/Matches.tsx";
import Teams from "./pages/Teams.tsx";
import Schools from "./pages/Schools.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Information from "./pages/Information.tsx";
import Sponsor from "./pages/Sponsor.tsx";
import About from "./pages/About.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import AuthCallback from "./pages/AuthCallback";
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
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/about" element={<About />} />
            <Route path="/home" element={<Home />} />
            <Route path="/brackets" element={<Brackets />} />
            <Route path="/match/:id" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route path="/information" element={<Information />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/home" />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/rootAdmin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
