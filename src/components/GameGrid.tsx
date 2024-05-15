import GameCard from "./GameCard";
import { games, casual_games } from '../data/gamesData';
import { useState } from "react";

function GameGrid() {

    const [comp, setComp] = useState(true);


    return (
        <div className="flex flex-wrap justify-center px-[100px]">
            <div className="px-4 pb-2 text-xl w-full font-barlow pb-8">
                <button className={comp ? "text-bright-buzz underline underline-offset-8 px-2" : "text-white underline-offset-4 duration-500 hover:text-bright-buzz px-2"} onClick={() => setComp(true)}>Competitive</button>
                <button className={!comp ? "text-bright-buzz underline underline-offset-8 px-2" : "text-white underline-offset-4 duration-500 hover:text-bright-buzz px-2"} onClick={() => setComp(false)}>Casual</button>
            </div>
            {Object.entries(comp ? games : casual_games).map(([name, game], index) => (
                <div className="p-4">
                    <GameCard
                        key={index}
                        image={game.image}
                        name={name}
                        link={game.pageLink}
                        discordLink={game.discordLink}
                    />
                </div>
            ))}
        </div>
    );
}

export default GameGrid;