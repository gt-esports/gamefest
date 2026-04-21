import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const linkClass = "text-[#7dd3f0] underline underline-offset-2 hover:text-white";

  const faqs: Array<{ question: string; answer: ReactNode }> = [
    {
      question: "When and where is GameFest 2026?",
      answer:
        "GameFest 2026 takes place on April 25 and 26 at the Campus Recreation Center. The About section above highlights the featured games for each day, so check that schedule before you register for brackets.",
    },
    {
      question: "How do I register for GameFest?",
      answer: (
        <>
          First, sign in with Discord and complete the event registration form on the{" "}
          <Link to="/register" className={linkClass}>
            registration page
          </Link>
          . After that, sign up for the specific tournaments you want to play on the{" "}
          <a
            href="https://www.start.gg/tournament/gamefest-2026/details"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            official start.gg page
          </a>
          .
        </>
      ),
    },
    {
      question: "Do I need to register separately for tournaments?",
      answer: (
        <>
          Yes. The event registration form secures your GameFest attendance, but each tournament bracket is managed separately on{" "}
          <a
            href="https://www.start.gg/tournament/gamefest-2026/details"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            start.gg
          </a>
          . You should complete both steps if you plan to compete.
        </>
      ),
    },
    {
      question: "What is the difference between General Admission and BYOC?",
      answer:
        "General Admission is for attendees coming to the event without bringing a full setup. BYOC stands for Bring Your Own Computer and is the option for players bringing their own PC setup to the LAN.",
    },
    {
      question: "Do I need a Discord account to register?",
      answer:
        "Yes. The site uses Discord sign-in for registration, profile access, and event coordination, so you will need to sign in with Discord before completing the form.",
    },
    {
      question: "Where should I look for updates, bracket links, and announcements?",
      answer: (
        <>
          Keep an eye on the{" "}
          <a
            href="https://discord.gg/P5hPgkca5N"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GameFest Discord
          </a>{" "}
          for live updates, and use the{" "}
          <a
            href="https://www.start.gg/tournament/gamefest-2026/details"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            start.gg page
          </a>{" "}
          for tournament registration and bracket information.
        </>
      ),
    },
    {
      question: "Has prizing been announced yet?",
      answer: (
        <>
          Yes. Prizing has been released, and you can view the latest details in the{" "}
          <a
            href="https://discord.gg/P5hPgkca5N"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GameFest Discord
          </a>
          .
        </>
      ),
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
              <p className="mt-3 text-start text-gray-200 select-text">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
