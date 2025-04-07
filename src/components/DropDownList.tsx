import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';


function DropDownList({ items, onSelect}: { items: string[], onSelect: (item: string) => void}) 
  {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-[335px] mb-8">
      <button
        className="w-full p-3 border border-white rounded-lg bg-transparent font-bayon text-2xl justify-between flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItem || 'Select a game'}
        <FaChevronDown
            className={`transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
            }`}
        />
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 mt-2 w-full z-50 bg-gradient-to-br from-[#233a6d]/80 to-[#472b2b]/80 border border-gray-500 rounded-lg shadow-lg max-h-[300px] overflow-auto">
          {items.map((item: string, index: number) => (
            <li
              key={index}
              className="p-2 text-white text-left font-bayon text-2xl hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DropDownList;