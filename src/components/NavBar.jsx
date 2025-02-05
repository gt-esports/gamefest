import React from "react";
import { Link } from "react-router-dom";
import '../styles/NavBar.css';
function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-circle"></div>
      <div className="logo">GT Esport</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/brackets">Brackets</Link></li>
        <li><Link to="/matches">Matches</Link></li>
        <li><Link to="/teams">Teams</Link></li>
        <li><Link to="/sponsor">Sponsor</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;