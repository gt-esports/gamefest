import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const Team = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const schoolTeam = [
    {
      school: "School A",
      answer: ""
    },
    {
      school: "School B",
      answer: "",
    },
    {
      school: "School C",
      answer: "",
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto p-4 px-20">
      <div className="space-y-4">
        {schoolTeam.map((tab, index) => (
          <div
            key={index}
            className={`border border-gray-300 rounded-lg p-4 bg-transparent text-white ${
              openIndex === index ? 'bg-opacity-80' : 'bg-opacity-60'
            } transition-all duration-200 ease-in-out`}
          >
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center text-left font-semibold text-white hover:text-purple-400 focus:outline-none"
            >
              <span className="text-lg tracking-wider">{tab.school}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <p className="mt-10 text-gray-200 text-start select-text">{tab.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
