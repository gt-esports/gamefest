import { Link, NavLink, useLocation } from "react-router-dom";

import Logo from "../assets/gt-esports-logo1.png";

import facebookLogo from "../assets/facebook-icon.svg";
import xLogo from "../assets/x-icon.svg";
import instagramLogo from "../assets/instagram-icon.svg";
import discordLogo from "../assets/discord-icon.svg";

function Footer() {
  const location = useLocation();

  const links = [
    { name: "HOME", link: "/home" },
    { name: "BRACKETS", link: "/brackets" },
    // { name: "MATCHES", link: "/matches" },
    { name: "TEAMS", link: "/teams" },
    { name: "SPONSORS", link: "/sponsor" },
    { name: "ABOUT", link: "/about" },
  ];

  const socialMedia = [
    {
      name: "discord",
      img: discordLogo,
      link: "https://discord.com/invite/gtesports",
    },
    { name: "x", img: xLogo, link: "https://twitter.com/gatechesports" },
    {
      name: "instagram",
      img: instagramLogo,
      link: "https://www.instagram.com/gatechesports_/",
    },
    {
      name: "facebook",
      img: facebookLogo,
      link: "https://www.facebook.com/groups/gtesports/",
    },
  ];

  return (
    <div className="mt-40 flex w-full flex-col bg-footer-shadow pb-6 pt-6">
      <div className="mb-4 flex w-full flex-wrap items-center justify-between md:flex-nowrap">
        {/* gatech logo */}
        <div className="ml-10 py-4 font-bayon text-3xl tracking-wide">
          <Link to="/home" className="flex items-center">
            <img
              src={Logo}
              alt="GT Esports Logo"
              width={72}
              height={72}
              className="mr-2"
            />
            <span className="text-tech-gold">GA TECH</span>{" "}
            <span className="ml-2 text-white">ESPORTS</span>
          </Link>
        </div>

        {/* social media */}
        <div className="ml-auto mr-auto flex flex-wrap items-center justify-center gap-3 text-xl text-white md:mr-0 lg:mr-0">
          <h1 className="w-full text-center">Connect With Us</h1>
          <ul className="flex flex-wrap justify-center">
            {socialMedia.map((icon) => (
              <li key={icon.name}>
                <Link to={icon.link}>
                  <img
                    src={icon.img}
                    alt={`${icon.name} logo`}
                    width={32}
                    height={32}
                    className="m-2"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* nav link and info */}
      <div className="flex w-full flex-wrap justify-between px-6 pb-6 text-center md:flex-nowrap">
        <div className="w-full md:w-auto">
          <ul className="ml-6 flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <li
                key={link.name}
                className="text-center text-lg md:my-0 md:mr-6"
              >
                <NavLink
                  to={link.link}
                  className={`${
                    location.pathname === link.link
                      ? "text-bright-buzz"
                      : "text-white"
                  } underline-offset-4 duration-500 hover:text-bright-buzz`}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="ml-auto mr-auto mt-9 text-white md:mr-6 md:mt-0 md:text-right lg:mr-12">
          <h1>georgiatechesports@gmail.com</h1>
          <h1>801 Atlantic Dr NW, Atlanta, GA 30332</h1>
        </div>
      </div>
    </div>
  );
}

export default Footer;
