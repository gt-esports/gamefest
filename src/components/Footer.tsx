import { NavLink, useLocation } from "react-router-dom";

import Logo from "../assets/gt-esports-logo1.png";

import facebookLogo from "../assets/facebook-icon.svg";
import xLogo from "../assets/x-icon.svg";
import instagramLogo from "../assets/instagram-icon.svg";
import discordLogo from "../assets/discord-icon.svg";

function Footer() {
  const location = useLocation();

  const links = [
    { name: "Home", link: "/home" },
    { name: "About", link: "/about" },
  ];

  const socialMedia = [
    { name: "Discord", img: discordLogo, link: "https://discord.gg/eYAask7tEJ" },
    { name: "Twitter", img: xLogo, link: "https://twitter.com/gatechesports" },
    { name: "Instagram", img: instagramLogo, link: "https://www.instagram.com/gatechesports_/" },
    { name: "Facebook", img: facebookLogo, link: "https://www.facebook.com/groups/gtesports/" },
  ];

  return (
    <footer className="mt-40 w-full border-t border-white/10 bg-footer-shadow">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Main grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: Logo + tagline */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <a
              href="https://gatechesports.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group w-fit"
            >
              <img
                src={Logo}
                alt="GT Esports Logo"
                width={56}
                height={56}
                className="shrink-0 transition-opacity duration-300 group-hover:opacity-80"
              />
              <div className="font-bayon leading-none">
                <div className="text-[#B3A369] text-xl tracking-wider">
                  GEORGIA TECH
                </div>
                <div className="text-white/90 text-sm tracking-[0.25em] mt-0.5">
                  ESPORTS
                </div>
                <div className="text-white/90 text-sm tracking-[0.25em]">
                  ORGANIZATION
                </div>
              </div>
            </a>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              The official esports and gaming student organization of the
              Georgia Institute of Technology. Fostering competitive
              excellence and community.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bayon text-sm tracking-[0.2em] text-blue-bright uppercase">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.link}
                    className={`text-sm transition-colors duration-300 ${
                      location.pathname === link.link
                        ? "text-blue-bright"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
              <li>
                <a
                  href="https://gatechesports.com/ourteam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                >
                  Our Team
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bayon text-sm tracking-[0.2em] text-blue-bright uppercase">
              Community
            </h3>
            <ul className="flex flex-col gap-3">
              {socialMedia.map((icon) => (
                <li key={icon.name}>
                  <a
                    href={icon.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors duration-300 group w-fit"
                  >
                    <img
                      src={icon.img}
                      alt={`${icon.name} logo`}
                      width={18}
                      height={18}
                      className="opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    {icon.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bayon text-sm tracking-[0.2em] text-blue-bright uppercase">
              Contact
            </h3>
            <div className="flex flex-col gap-1.5 text-sm text-white/60">
              <span>georgiatechesports@gmail.com</span>
              <span>Georgia Institute of Technology</span>
              <span>Atlanta, GA 30332</span>
            </div>
            <a
              href="https://gatechesports.com/ourteam"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-fit rounded bg-gradient-to-r from-blue-medium to-blue-accent px-4 py-2 font-bayon text-sm text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-bright/20 hover:brightness-110"
            >
              Meet Our Team
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Georgia Tech Esports Organization. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialMedia.map((icon) => (
              <a
                key={icon.name}
                href={icon.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={icon.name}
              >
                <img
                  src={icon.img}
                  alt={icon.name}
                  width={18}
                  height={18}
                  className="opacity-30 transition-opacity duration-300 hover:opacity-80"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
