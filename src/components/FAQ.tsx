// FAQ.tsx
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa'; // Use a Chevron icon for toggling (install react-icons if needed)

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Replace FAQ text with the provided content
  const faqs = [
    {
      question: "Is this organization only for competitive gamers?",
      answer: "Not at all! We host gaming communities for competitive and casual gamers alike. Check out our games page" +
          " to see a list of our communities!",
    },
    {
      question: "What are the time commitments for this organization?",
      answer: "There is no specific time commitment necessary to join our communities. Depends on your expectations and interests for the gaming community!",
    },
    {
      question: "How do I join?",
      answer: "Discord links in the Games Page, link to our main Discord: https://discord.gg/gtesports, link to our Engage: https://gatech.campuslabs.com/engage/organization/esports.",
    },
    {
      question: "How are points distributed amongst Team Members?",
      answer: "All of a team's members receive the same number of points based on their placement in an event. Beat out your team members for the grand prize by outperforming them in other tournaments and challenges.",
    },
    {
      question: "Are there other prizes associated with the Director's Cup?",
      answer: "While not associated with the Director's Cup, the winning teams for each of our eight headliner tournaments will receive select prizing in the form of gaming peripherals. Each member of the 1st place team will receive one of the listed prizes. The full list of prizes can be found in the #info channel."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto p-4 px-20">
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border border-gray-300 rounded-lg p-4 bg-gray-800 text-white ${
              openIndex === index ? 'bg-opacity-80' : 'bg-opacity-60'
            } transition-all duration-200 ease-in-out`}
          >
            <button
              onClick={() => handleToggle(index)}
              className="w-full flex justify-between items-center text-left font-semibold text-white hover:text-blue-bright focus:outline-none"
            >
              <span className="text-lg tracking-wider">{faq.question}</span>
              <FaChevronDown
                className={`transition-transform duration-200 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-200 text-start select-text">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
