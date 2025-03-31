import { useState } from "react";

interface SearchProps {
  onSearch: (query: string) => void;
  items: string[];
  placeholder?: string;
}

const SearchBar: React.FC<SearchProps> = ({ onSearch, items, placeholder = "Search..." }) => {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (item: string) => {
    onSearch(item.toLowerCase());
    setSearch("");
  };

  return (
    <div className="relative hidden lg:block w-full max-w-[335px] mb-8">
      <input
        type="text"
        placeholder={placeholder}
        className="p-3 border border-white rounded-lg bg-transparent font-bayon text-2xl w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => (e.key === "Enter" ? handleSearch(search) : null)}
      />
      {search && filteredItems.length > 0 && (
        <ul className="absolute top-full left-0 mt-2 w-full z-50 bg-gradient-to-br from-[#233a6d]/80 to-[#472b2b]/80 border border-gray-500 rounded-lg shadow-lg">
          {filteredItems.map((item, index) => (
            <li
              key={index}
              className="p-2 text-white text-left font-bayon text-2xl hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSearch(item)}
            >
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
