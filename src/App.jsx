import Navbar from "./components/NavBar";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Brackets from "./pages/Brackets.jsx";
import Matches from "./pages/Matches.jsx";
import Teams from "./pages/Teams.jsx";
import Sponsor from "./pages/Sponsor.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/brackets" element={<Brackets />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/sponsor" element={<Sponsor />} />
      </Routes>
    </Router>
  );
}

export default App;
