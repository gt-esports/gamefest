import { Routes, Route, Navigate } from "react-router-dom";
// Components
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Brackets from "./pages/Brackets.tsx";
import Matches from "./pages/Matches.tsx";
import Teams from "./pages/Teams.tsx";
import Sponsor from "./pages/Sponsor.tsx";
import About from "./pages/About.tsx";

function App() {
  return (
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
        <Route path="/sponsor" element={<Sponsor />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
