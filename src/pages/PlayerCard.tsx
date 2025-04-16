import { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus, FaLock } from "react-icons/fa";
import val_image from "../assets/valorant_theme_img.png";
import cs2_image from "../assets/CS2_theme_img.png";
import rl_image from "../assets/Rocket_League_theme_img.png";
import apex_image from "../assets/Apex_theme_img.png";
import { useAuth, useUser } from "@clerk/clerk-react";

interface ThemeOption {
  name: string;
  classname: string;
  image: string;
  bgColor?: string;
  id?: string;
}

type ThemeCategory = "background" | "borders" | "card" | "badges";

interface Player {
  name: string;
  points: number;
  participation: string[];
  teamAssignments: { game: string; team: string }[];
}

interface Theme {
  background: string;
  borderStyle: string;
  badges: (string | null)[];
  bgColor?: string;
  bgCard: string;
}

const themes: Record<ThemeCategory, ThemeOption[]> = {
  background: [
    { name: "None", classname: "", image: "" },
    { name: "Valorant", classname: "valorant-bg", image: val_image, bgColor: "#0f0c1a", id: "valorant" },
    { name: "CS2", classname: "cs2-bg", image: cs2_image, bgColor: "#1c1f1d", id: "cs2" },
    { name: "Rocket League", classname: "rl-bg", image: rl_image, bgColor: "#0a0e1a", id: "rocket_league" },
    { name: "Apex", classname: "apex-bg", image: apex_image, bgColor: "#1a0d0d", id: "apex" },
  ],
  borders: [
    { name: "None", classname: "", image: "" },
    { name: "Blue", image: "", classname: "border-4 border-blue-500" },
    { name: "Red", image: "", classname: "border-4 border-red-500" },
    { name: "Green", image: "", classname: "border-4 border-green-500" },
    { name: "Purple", image: "", classname: "border-4 border-purple-500" },
    { name: "Yellow", image: "", classname: "border-4 border-yellow-400" },
    { name: "Pink", image: "", classname: "border-4 border-pink-500" },
    { name: "Black", image: "", classname: "border-4 border-black" },
    { name: "White", image: "", classname: "border-4 border-white" },
    { name: "Dashed Gray", image: "", classname: "border-4 border-dashed border-gray-500" },
    { name: "Dotted Blue", image: "", classname: "border-4 border-dotted border-blue-400" },
    { name: "Hover Glow", image: "", classname: "border-4 border-tech-gold hover:shadow-lg hover:shadow-tech-gold transition-shadow duration-300" },
  ],  
  
  card: [
    { name: "None", classname: "", image: "" },
    { name: "Valorant", image: "", classname: "" },
    { name: "CS2", image: "", classname: "" },
    { name: "Rocket League", image: "", classname: "" },
    { name: "Apex", image: "", classname: "" },
  ],
  badges: [
    { name: "None", classname: "", image: "" },
    { name: "Pink to Purple", image: "", classname: "bg-gradient-to-r from-pink-500 to-purple-500" },
    { name: "Orange to Red", image: "", classname: "bg-gradient-to-r from-orange-300 to-red-600" },
    { name: "Valorant", classname: "valorant-bg", image: val_image },
  ],
};

// use to check ids for lock/unlock
const checkId = (id: string): string => {
  return id.toLowerCase().replace(/[\s_-]/g, '');
};

const PlayerCard = () => {
  const [background, setBackground] = useState<string>("");
  const [bgColor, setBgColor] = useState<string>("");
  const [bgCard, setBgCard] = useState<string>("");
  const [borderStyle, setBorderStyle] = useState<string>("");
  const [badges, setBadges] = useState<(string | null)[]>(Array(4).fill(null));
  const [tab, setTab] = useState<ThemeCategory>("background");
  const [activeBadge, setActiveBadge] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const [players, setPlayers] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["none"]);

  const { getToken } = useAuth();
  const { user } = useUser();

  // Load saved profile
  useEffect(() => {
    const savedProfile = () => {
      try {
        const savedThemeJson = localStorage.getItem('playerCard');
        if (savedThemeJson) {
          const savedTheme: Theme = JSON.parse(savedThemeJson);
          setBackground(savedTheme.background || "");
          setBorderStyle(savedTheme.borderStyle || "");
          setBadges(savedTheme.badges || Array(4).fill(null));
          setBgColor(savedTheme.bgColor || "");
          setBgCard(savedTheme.bgCard || "");
        }
        setProfileLoaded(true);
      } catch (error) {
        console.error("Error loading saved profile:", error);
        setProfileLoaded(true);
      }
    };
    
    savedProfile();
  }, []);

  // Save theme whenever they change
  useEffect(() => {
    if (profileLoaded) {
      const save: Theme = {
        background,
        borderStyle,
        badges,
        bgColor,
        bgCard
      };
      
      try {
        localStorage.setItem('playerCard', JSON.stringify(save));
      } catch (error) {
        console.error("Error saving:", error);
      }
    }
  }, [background, borderStyle, badges, bgColor, bgCard, profileLoaded]);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        console.log("token: ", token);
        const res = await fetch(`/api/players/${user?.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("data", data);
        setPlayers(data);
        console.log("players:", data);
        
        // Set unlocked themes based on participation
        if (data && data.participation && Array.isArray(data.participation)) {
          const unlocked = ["none"];
          
          data.participation.forEach((game: string) => {
            const id = checkId(game);
            
            // Match participation with ids
            if (id === "valorant") unlocked.push("valorant");
            if (id === "cs2") unlocked.push("cs2");
            if (id === "rocketleague") unlocked.push("rocket_league");
            if (id === "apex") unlocked.push("apex");
          });
          
          setUnlockedThemes(unlocked);
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, [getToken, user?.username]);

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

  const handleThemeSelection = (themeType: ThemeCategory, theme: ThemeOption, badgeIndex?: number) => {
    if (themeType === "background") {
      if (theme.id && !unlockedThemes.includes(theme.id)) {
        return;
      }
      setBackground(theme.image);
      setBgColor(theme.bgColor || "");
    } else if (themeType === "badges" && badgeIndex !== undefined) {
      setBadges((prev) => {
        const newBadges = [...prev];
        newBadges[badgeIndex] = theme.classname;
        return newBadges;
      });
    } else if (themeType === "borders") {
      setBorderStyle(theme.classname);
    } else if (themeType === "card") {
      setBgCard(theme.classname);
    }
  };

  // Check if a background is locked
  const isLocked = (theme: ThemeOption): boolean => {
    if (tab !== "background" || !theme.id) return false;
    return !unlockedThemes.includes(theme.id);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full">
        <div
          className={`relative w-full h-[500px] rounded-xl bg-cover bg-center transition-all duration-500 ease-in-out`}
          style={{
            backgroundImage: background ? `url(${background})` : 'none',
            backgroundColor: bgColor || 'transparent',
            backgroundBlendMode: 'screen',
          }}
        >
          <div className="flex justify-center h-[400px] pt-6">
            {/* Player Card */}
            <div
              className={`w-[340px] h-[300px] mt-16 rounded-xl flex flex-col justify-center items-center space-y-8 ${borderStyle}`}
            >
              <div
                className="flex flex-col justify-center items-center rounded-tl-lg rounded-tr-lg bg-[#0F1F3C] bg-opacity-60 text-white px-4"
                style={{
                  width: "320px",
                  height: "150px",
                  clipPath: "polygon(0 0, 0 70%, 20% 100%, 80% 100%, 100% 70%, 100% 100%, 100% 0)",
                }}
              >
                {/* Display user name and token */}
                {isLoading ? (
                  <p className="text-gray-400 animate-pulse">Loading player data...</p>
                ) : (
                  <div className="text-center">
                    <p className="text-4xl font-bayon">{players?.name}</p>
                    <p className="text-md text-tech-gold font-bayon">
                      TOKENS: {players ? players.points : "N/A"}
                    </p>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div
                ref={badgeRef}
                className="flex w-[320px] space-x-6 justify-center bg-[#0F1F3C] bg-opacity-60 py-6 rounded-xl"
              >
                {badges.map((badge, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTab("badges");
                      setActiveBadge(index);
                    }}
                    className={`w-12 h-12 rounded flex items-center border-2 justify-center transition
                    ${badge || badge === "" ? `${badge}` : "border-2 text-gray-200 hover:bg-gray-700"} 
                    ${activeBadge === index ? "border-b-4 border-tech-gold" : ""} duration-1000 ease-in-out`}
                    title="Add or edit badge"
                  >
                    <div className="text-white">{badge ? null : "+"}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom panel */}
          <div className="pb-2">
            {panelOpen ? (
              <div className="w-full h-full bg-opacity-50 border-white/20 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] shadow-lg border rounded-2xl p-4">
                <button
                  onClick={() => setPanelOpen(false)}
                  className="flex justify-center items-center w-[20px] h-[20px] rounded-xl ml-auto p-4 text-white font-bold bg-tech-gold"
                >
                  <div><FaMinus /></div>
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
                {/* Content */ }
                <div className="grid grid-cols-2 gap-4 max-h-[100px] overflow-y-auto pr-2">
                  {themes[tab].map((theme, index) => {
                    const locked = isLocked(theme);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!locked) {
                            if (tab === "badges" && activeBadge !== null) {
                              handleThemeSelection("badges", theme, activeBadge);
                            } else if (tab === "borders") {
                              handleThemeSelection("borders", theme);
                            } else if (tab === "background") {
                              handleThemeSelection("background", theme);
                            } else if (tab === "card") {
                              handleThemeSelection("card", theme);
                            }
                          }
                        }}
                        className={`p-4 rounded text-lg ${theme.classname} text-white font-bayon relative
                          ${theme.name === "None" ? "border-2 border-gray-700" : ""}
                          ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={locked}
                      >
                        {theme.name}

                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                            <FaLock className="text-white text-2xl" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex mt-32 bg-opacity-50 border-white/20 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] shadow-lg border-t rounded-2xl p-4">
                <button
                  onClick={() => setPanelOpen(true)}
                  className="flex justify-center items-center bg-tech-gold w-[20px] h-[20px] text-white p-4 rounded-xl ml-auto"
                >
                  <div><FaPlus /></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;