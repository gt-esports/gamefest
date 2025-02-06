import React from 'react';
import Carousel from "../components/Carousel";

function Home() {
    function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        window.location.href = (e.target as HTMLButtonElement).value;
    }

    return (
        <div>
            <div className="w-dvw h-dvh bg-primary flex items-center justify-center bg-[#505050] ">
                <h1 style={{fontFamily: 'Bayon, san-serif'}} className="px-3 py-3 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl">
                    GA Tech Esports
                </h1>
            </div>
            <div>
            <h2 style={{fontFamily: 'Bayon, san-serif'}} className="flex pb-16 pt-24 text-center justify-center text-5xl font-normal tracking-wide text-white">
                    Tournament Schedule
                </h2>
            </div>
            <div className="flex flex-col items-center justify-center pt-24">
                <h2 style={{fontFamily: 'Bayon, san-serif'}} className="flex pb-16 pt-24 text-center justify-center text-5xl font-normal tracking-wide text-white">
                    Current Games
                </h2>
                {/* <Carousel /> */}
                <button
                    onClick={handleButtonClick}
                    value="/games"
                    className="mt-28 h-16 w-48 rounded-md bg-tech-gold font-barlow text-white"
                >
                    VIEW ALL
                </button>
            </div>
            <div>
                <h2 style={{fontFamily: 'Bayon, san-serif'}} className="flex pb-16 pt-24 text-center justify-center text-5xl font-normal tracking-wide text-white">
                    Message from our sponsors
                </h2>
                <h2 style={{fontFamily: 'Bayon, san-serif'}} className="flex pb-16 pt-24 text-center justify-center text-5xl font-normal tracking-wide text-white">
                    Sponsors
                </h2>
            </div>
        </div>
    );
}

export default Home;