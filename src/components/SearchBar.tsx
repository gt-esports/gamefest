import React, { useState } from "react";

interface SearchProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchProps> = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const schools = ["School A", "School B", "School C", "School D", "School E", "School F", "School G"];

  const filterSchool = schools.filter((school) =>
    school.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (school: string) => {
    onSearch(school.toLowerCase());
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
        onKeyDown={e => e.key ==='Enter' ? handleSearch(search) : null}

      />
      {search && filterSchool.length > 0 && (
        <ul className="relative mt-2 bg-gradient-to-br from-[#233a6d]/80 to-[#472b2b]/80 border border-gray-500 rounded-lg shadow-lg">
          {filterSchool.map((school, index) => (
            <li
              key={index}
              className="p-2 text-white font-bayon text-2xl hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSearch(school)}
            >
              {school}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
