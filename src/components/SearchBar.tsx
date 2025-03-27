import { useState } from "react";

interface SearchProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchProps> = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const games = ["Counter Strike", "League of Legends", "Valorant", "Dota 2", "Fortnite", "Overwatch", "Brawl Stars"];

  const filterGame = games.filter((game) =>
    game.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (game: string) => {
    onSearch(game.toLowerCase());
    setSearch("");
  };

  return (
    <div className="relative w-full max-w-[335px] mb-8">
      <input
      type="text"
      placeholder="Search..."
      className="w-full p-3 border border-white rounded-lg bg-transparent font-bayon text-2xl"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => (e.key === "Enter" ? handleSearch(search) : null)}
      />
      {search && filterGame.length > 0 && (
      <ul className="absolute top-full left-0 mt-2 w-full z-50 bg-gradient-to-br from-[#233a6d]/80 to-[#472b2b]/80 border border-gray-500 rounded-lg shadow-lg">
        {filterGame.map((game, index) => (
        <li
          key={index}
          className="p-2 text-white text-left font-bayon text-2xl hover:bg-gray-700 cursor-pointer"
          onClick={() => handleSearch(game)}
        >
          {game}
        </li>
        ))}
      </ul>
      )}
    </div>
  );
};

export default SearchBar;
