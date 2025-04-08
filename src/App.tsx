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
import Sponsor from "./pages/Sponsor.tsx";
import About from "./pages/About.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import RootAdminPanel from "./components/adminPanel/RootAdminPanel.tsx";
// import { Root } from "postcss";

const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(212, 179, 86, 0.5);  /* tech-gold with opacity */
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(212, 179, 86, 0.8);
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
            <Route path="/matches" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/home" />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/rootAdmin" element={<RootAdminPanel />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
