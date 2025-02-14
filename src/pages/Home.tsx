import React from 'react';
import Carousel from "../components/Carousel.tsx";
import Avatar from "../components/Avatar.tsx";
import TournamentCard from "../components/TournamentCard.tsx";
import { sponsors } from "../data/sponsors.ts";
import Navbar from '../components/NavBar.jsx';
import Footer from '../components/Footer.jsx';

const tournaments = [
    {
        title: 'Tournament 1',
    },
    {
        title: 'Tournament 2',
    },
    {
        title: 'Tournament 3',
    },
];

function Home() {
    function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        window.location.href = (e.target as HTMLButtonElement).value;
    }

    return (
        <div className="w-dvw h-dvh">
            <Navbar />
            <main>
            <div className="w-dvw h-dvh flex items-center justify-center bg-[#505050] ">
                <h1 
                    style={{fontFamily: 'Bayon, sans-serif'}} 
                    className="px-3 py-3 text-9xl font-normal text-tech-gold xs:rounded-lg xs:text-5xl xs:backdrop-blur-lg sm:text-7xl md:text-8xl lg:text-9xl">
                    GA Tech Esports
                </h1>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
                <div className="flex p-24 flex-row items-center justify-center">
                    <h2 style={{fontFamily: 'Bayon, sans-serif'}} className="font-bayon text-5xl font-normal text-white">
                        TOURNAMENT SCHEDULE
                    </h2>
                </div>
                <div className="w-2/3">
                    {tournaments.map((tournament) => (
                        <TournamentCard 
                            title={tournament.title} 
                        />
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="flex p-24 flex-row items-center justify-center">
                    <h2 style={{fontFamily: 'Bayon, sans-serif'}} className="font-bayon text-5xl font-normal text-white">
                        CURRENT GAME
                    </h2>
                </div>
                <div className="flex mx-auto mt-5 flex w-4/5 max-w-screen-xl flex-col items-center">
                    <Carousel />
                    <button
                        onClick={handleButtonClick}
                        value="/"
                        className="mt-24 h-16 w-48 rounded-md bg-tech-gold font-barlow text-white"
                    >
                        VIEW ALL
                    </button>
                </div>
            </div>
            <div>
                <div className="flex p-24 flex-row items-center justify-center">
                    <h2 style={{fontFamily: 'Bayon, sans-serif'}} className="font-bayon text-5xl font-normal text-white">
                        MESSAGE FROM OUR SPONSORS
                    </h2>
                </div>
                <div className="flex flex-row items-center justify-center">
                    <p className="text-5xl font-normal text-white">
                        "                                                                         "
                    </p>
                </div>
                <div className="flex p-24 flex-row items-center justify-center">
                    <h2 style={{fontFamily: 'Bayon, sans-serif'}} className="font-bayon text-5xl font-normal text-white">
                        SPONSORS
                    </h2>
                </div>
                <div className="flex flex-row items-center justify-center">
                    {sponsors.map((sponsor) => (
                        <Avatar 
                            src={sponsor.src} 
                            alt={sponsor.alt}
                        />
                    ))}
                </div>
            </div>
            </main>
            <Footer/>
        </div>
    );
}

export default Home;