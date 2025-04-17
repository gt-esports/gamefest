// FAQ.tsx
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa'; // Use a Chevron icon for toggling (install react-icons if needed)

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Replace FAQ text with the provided content
  const faqs = [
    {
      question: "How do I register for GameFest 2025?",
      answer: (
        <>
          Grab your free ticket at{' '}
          <a
            href="https://www.ticketleap.events/tickets/gtesports/gamefest-2025-1853548566"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tech-gold underline"
          >
            Ticketleap
          </a>
          , then hop into our Discord ({' '}
          <a
            href="https://discord.gg/trg88CR6Q3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tech-gold underline"
          >
            discord.gg/trg88CR6Q3
          </a>
          ) to complete your BYOC or console sign‑up! For full tournament brackets and match details, check out our Start.gg page:{' '}
          <a
            href="https://www.start.gg/tournament/gamefest-2025-1/details"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tech-gold underline"
          >
            GameFest 2025 on Start.gg
          </a>
          .
        </>
      )
    },
    {
      question: "Do I need to bring my own PC or console?",
      answer: `PC players: you’re welcome to bring your own setup (and we’ll have plenty of outlets!), but we’ll also provide a limited number of PCs on a first‑come, first‑served basis. Console players: we supply TVs and controllers, though bringing your own is totally fine for extra comfort!`,
    },
    {
      question: "What titles are included this year?",
      answer: `We've got speedruns, shooters, racers, and more! Check the Games page for the full schedule: Minecraft Speedrun, Fortnite Solo LAN, Mario Kart 8 DX, Smash Ultimate, Street Fighte 6, Guilty Gear Strive, and several surprise challenges.`,
    },
    {
      question: "How does the Director’s Cup points system work?",
      answer: `Every match and side‑challenge awards weighted points. Top point earners enter the Grand Prize raffle for a custom PC. There’s also an unweighted draw for AMD Radeon RX6750XT GPUs—just by showing up!`,
    },
    {
      question: "Can I compete if I’m new to esports?",
      answer: `Absolutely! We have casual brackets and pickup matches for rookies.`,
    },
    {
      question: "Where and when should I arrive?",
      answer: `GameFest 2025 runs April 19th, 9 AM–8 PM at the Instructional Center. Doors open at 8 AM for setup—look for the big GT Esports banners at the entrance!`,
    },
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
              className="w-full flex justify-between items-center text-left font-semibold text-white hover:text-blue-400 focus:outline-none"
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
