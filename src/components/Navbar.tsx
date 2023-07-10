import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { GrClose } from "react-icons/gr";
import Logo from "/logo.png";

function Navbar() {
    const links = [
        { name: "HOME", link: "/" },
        { name: "ABOUT", link: "/" },
        { name: "OTHER LINK", link: "/" },
        { name: "COOL LINK", link: "/" },
    ];

    const [open, setOpen] = useState(false);

    return (
        <div className="shadow-md w-full fixed top-0 left-0">
            <div className="md:flex items-center justify-between bg-white h-[--navbar-height] md:py-6 py-2 md:px-10 px-7">
                <div className="font-bold text-2xl cursor-pointer flex items-center font-[Poppins] text-gray-800">
                    <img
                        src={Logo}
                        alt="GTEsports Logo"
                        width={64}
                        height={64}
                    />
                    <span className="ml-2">GTEsports</span>
                </div>
                <div
                    onClick={() => setOpen(!open)}
                    className="text-3xl absolute right-8 top-6 cursor-pointer md:hidden"
                >
                    {!open ? <RxHamburgerMenu /> : <GrClose />}
                </div>
                <ul
                    className={`md:flex md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto ${
                        open ? "top-[64px]" : "top-[-490px]"
                    }`}
                >
                    {links.map((link) => (
                        <li
                            key={link.name}
                            className="md:ml-8 text-xl md:my-0 my-7 text-center"
                        >
                            <a
                                href={link.link}
                                className="text-gray-800 hover:text-gray-400 duration-500"
                            >
                                {link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Navbar;
