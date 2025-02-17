import React, { useState, useRef, useEffect } from 'react';
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

const sponsorsPerPage = 5;

function Home() {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(sponsors.length / sponsorsPerPage);
    const scroll = useRef<HTMLDivElement>(null);

    const handleWheelScroll = (event: WheelEvent) => {
        event.preventDefault();
        setCurrentPage((prev) => {
            if (event.deltaY > 0) {
                return prev === totalPages - 1 ? 0 : prev + 1; // loop to first page
            } else {
                return prev === 0 ? totalPages - 1 : prev - 1; // loop to last
            }
        });
    };

    useEffect(() => {
        if (scroll.current) {
            scroll.current.scrollLeft = currentPage * scroll.current.clientWidth;
        }
    }, [currentPage]);

    useEffect(() => {
        const scrollCarousel = scroll.current;
        if (scrollCarousel) {
            scrollCarousel.addEventListener("wheel", handleWheelScroll);
        }
        return () => {
            if (scrollCarousel) {
                scrollCarousel.removeEventListener("wheel", handleWheelScroll);
            }
        };
    }, []);

    return (
        <div className="w-dvw h-dvh">
            <Navbar />
            <div className="w-dvw h-dvh bg-primary flex items-center justify-center bg-[#505050] ">
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
                {/* Sponsor */}
                <div className="flex flex-wrap w-screen justify-center items-center">
                    <div
                        ref={scroll}
                        className="overflow-x-auto flex w-full pb-40"
                        style={{ maxWidth: `${sponsors.length * 60, window.innerWidth}px` }}
                    >
                        {/* Sponsor Pages */}
                        {Array.from({length: totalPages}).map((_, pageIndex) => (
                            <div
                                key={pageIndex}
                                className="flex flex-wrap justify-center"
                                style={{ minWidth: '100%' }}
                            >
                                <div className="flex flex-wrap justify-center items-center w-full">
                                    {sponsors
                                        .slice(pageIndex * sponsorsPerPage, (pageIndex + 1) * sponsorsPerPage)
                                        .map((sponsor, index) => (
                                            <div key={index} className="m-5">
                                                <Avatar src={sponsor.src} alt={sponsor.alt} />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Home;
