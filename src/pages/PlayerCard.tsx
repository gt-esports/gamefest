import { useEffect, useRef, useState } from "react";
import { FaChevronUp, FaMinus } from "react-icons/fa";

interface ThemeOption {
  name: string;
  classname: string;
}

type ThemeCategory = "background" | "borders" | "badges";

const themes: Record<ThemeCategory, ThemeOption[]> = {
  background: [
    { name: "None", classname: "" },
    { name: "Blue to Red", classname: "bg-gradient-to-r from-blue-500 to-red-500" },
    { name: "White to Black", classname: "bg-gradient-to-r from-white to-black" },
  ],
  borders: [
    { name: "None", classname: "" },
    { name: "Solid Blue", classname: "border-4 border-blue-500" },
    { name: "Dashed Gray", classname: "border-4 border-dashed border-gray-500" },
  ],
  badges: [
    { name: "None", classname: "" },
    { name: "Pink to Purple", classname: "bg-gradient-to-r from-pink-500 to-purple-500" },
    { name: "Orange to Red", classname: "bg-gradient-to-r from-orange-300 to-red-600" },
  ],
};

const PlayerCard = () => {
  const [background, setBg] = useState("");
  const [tab, setTab] = useState<ThemeCategory>("background");
  const [badges, setBadges] = useState<(string | null)[]>(Array(5).fill(null));
  const [activeBadge, setActiveBadge] = useState<number | null>(null);
  const [borderStyle, setBorderStyle] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  const badgeRef = useRef<HTMLDivElement | null>(null);

  // handle clicks outside the badge area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        if (tab === "badges") {
          setTab("background");
          setActiveBadge(null);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [tab]);

  return (
    <div className="pb-40">
      <div className="flex justify-center items-center">
        <div className={`flex w-full flex-col ${background} bg-cover my-36`}>

          <div className="flex justify-center pt-20 pb-20">
            <div className={`w-[400px] h-[500px] bg-navy-blue bg-opacity-50 rounded-2xl flex flex-col justify-center items-center space-y-4 ${borderStyle}`}>
              {/* Player and Points */}
              <div>
                <div
                  className="flex mb-20 justify-center items-center rounded-tl-lg rounded-tr-lg bg-gradient-to-b from-[#5b8c9b]/20 to-[#2c2828]/50 text-white"
                  style={{
                    width: "300px",
                    height: "150px",
                    clipPath: "polygon(0 0, 0 70%, 20% 100%, 80% 100%, 100% 70%, 100% 100%, 100% 0)" // cut off bottom corners
                  }}
                >
                  {/* API get user and points here */}
                </div>
              </div>

              {/* Badges Section (5 placeholders) */}
              <div className="flex space-x-4 bg-navy-blue bg-opacity-30 p-8 rounded-2xl" ref={badgeRef}>
                {badges.map((badge, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTab("badges");
                      setActiveBadge(index);
                    }}
                    className={`w-12 h-12 rounded flex items-center justify-center transition
                        ${badge ? `${badge}` : 
                            "border-2 border-opacity-20 text-gray-200 hover:bg-gray-700"} 
                        ${activeBadge === index ? "border-b-4 border-tech-gold" : ""} duration-1000 ease-in-out`}
                    title="Add or edit badge"
                  >
                    {badge ? null : "+"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          {panelOpen && (
            <div className="fixed bottom-0 w-full bg-opacity-50 border-white/20 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] shadow-lg border-t rounded-t-2xl p-4">
              {/* Minimize Button */}
              <button
                onClick={() => setPanelOpen(false)}
                className="absolute top-2 right-2 text-white font-bold"
              >
                <div className="pr-2"><FaMinus /></div>
              </button>

              {/* Tabs */}
              <div className="flex space-x-4 mb-4 justify-center">
                {Object.keys(themes).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key !== "badges" || activeBadge !== null) {
                        setTab(key as ThemeCategory);
                      }
                    }}
                    className={`px-4 py-2 rounded text-lg font-bayon text-white 
                      ${tab === key ? "bg-tech-gold" : "bg-transparent"} 
                      ${key === "badges" && activeBadge === null ? "text-gray-500 cursor-not-allowed" : ""}`}
                    disabled={key === "badges" && activeBadge === null}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>


              {/* Theme */}
              <div className="grid grid-cols-4 gap-4">
                {themes[tab].map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (tab === "badges" && activeBadge !== null) {
                        setBadges((prev) => {
                          const newBadges = [...prev];
                          newBadges[activeBadge] = theme.classname;
                          return newBadges;
                        });
                      } else if (tab === "borders") {
                        setBorderStyle(theme.classname);
                      } else {
                        setBg(theme.classname);
                      }
                    }}
                    className={`p-4 rounded text-lg ${theme.classname} text-white font-bayon ${theme.name === "None" ? "border-2 border-gray-700" : ""}`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toggle panel */}
          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="fixed bottom-0 w-full text-center bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] text-white p-4 rounded-t-2xl"
            >
              <div className="flex justify-center items-center"><FaChevronUp /></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
