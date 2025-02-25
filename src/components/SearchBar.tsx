import { useState } from "react";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const schools = ["School A", "School B", "School C", "School D", "School E", "School F", "School G"];

  const filterSchool = schools.filter((school) =>
    school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-xs mx-20">
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-3 border border-gray-300 rounded-lg bg-transparent font-bayon text-2xl"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <ul className="relative mt-2 bg-gray-500 border border-gray-500 rounded-lg shadow-lg">
          {filterSchool.map((school, index) => (
            <li key={index} className="p-2 text-white font-bayon text-2xl hover:bg-gray-700">
              {school}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
