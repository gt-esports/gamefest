import { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus, FaLock } from "react-icons/fa";
import { useUser } from "../hooks/useAuth";
import { useCurrentPlayer } from "../hooks/usePlayers";

interface ThemeOption {
  name: string;
  classname: string;
  image?: string;
  bgColor?: string;
  id?: string;
}

type ThemeCategory = "background" | "borders" | "card" | "badges";

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
    {
      name: "Valorant",
      classname: "valorant-bg",
      bgColor: "#0f0c1a",
      id: "valorant",
    },
    {
      name: "Counter Strike 2",
      classname: "cs2-bg",
      bgColor: "#1c1f1d",
      id: "cs2",
    },
    {
      name: "Rocket League",
      classname: "rl-bg",
      bgColor: "#0a0e1a",
      id: "rocket_league",
    },
    {
      name: "Apex Legends ",
      classname: "apex-bg",
      bgColor: "#1a0d0d",
      id: "apex",
    },
    {
      name: "Overwatch 2 ",
      classname: "ow2-bg",
      bgColor: "#1a0d0d",
      id: "ow2",
    },
    {
      name: "Marvel Rivals ",
      classname: "marvel-bg",
      bgColor: "#1c1f1d",
      id: "rival",
    },
    {
      name: "League of Lengends ",
      classname: "league-bg",
      bgColor: "#0a0e1a",
      id: "league",
    },
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
    {
      name: "Dashed Gray",
      image: "",
      classname: "border-4 border-dashed border-gray-500",
    },
    {
      name: "Dotted Blue",
      image: "",
      classname: "border-4 border-dotted border-blue-400",
    },
    {
      name: "Hover Glow",
      image: "",
      classname:
        "border-4 border-tech-gold hover:shadow-lg hover:shadow-tech-gold transition-shadow duration-300",
    },
  ],

  card: [
    { name: "Navy Blue", classname: "bg-[#0F1F3C] bg-opacity-60", image: "" },
    {
      name: "Valorant",
      image: "",
      classname: "bg-gradient-to-br from-red-900/80 to-navy-blue/80",
    },
    {
      name: "CS2",
      image: "",
      classname: "bg-gradient-to-bl from-black/80 to-white/80",
    },
    {
      name: "Rocket League",
      image: "",
      classname: "bg-gradient-to-br from-blue-900/80 to-green-900/80",
    },
    {
      name: "Apex",
      image: "",
      classname: "bg-gradient-to-tl from-green-400/80 to-gray-400/80",
    },
  ],
  badges: [
    { name: "None", classname: "", image: "", id: "none" },
    { name: "Apex", classname: "apex-badge-bg", id: "apex" },
    { name: "Beat Saber", classname: "beat-badge-bg", id: "beat saber" },
    { name: "CS2", classname: "cs2-badge-bg", id: "cs2" },
    { name: "Geogeusser", classname: "geo-badge-bg", id: "geo" },
    { name: "Guilty Gear", classname: "guilty-badge-bg", id: "gg" },
    { name: "League of Legends", classname: "league-badge-bg", id: "league" },
    { name: "MK8DX", classname: "mk-badge-bg", id: "mk" },
    { name: "Marvel Rivals", classname: "marvel-badge-bg", id: "marvel" },
    { name: "OSU", classname: "osu-badge-bg", id: "osu" },
    { name: "Overwatch 2", classname: "ow2-badge-bg", id: "ow2" },
    { name: "Rainbow 6 Siege", classname: "r6-badge-bg", id: "r6" },
    { name: "Smash", classname: "smash-badge-bg", id: "smash" },
    { name: "Street Fighter", classname: "street-badge-bg", id: "street" },
    { name: "Supercell", classname: "super-badge-bg", id: "supercell" },
    { name: "TFT", classname: "tft-badge-bg", id: "tft" },
    { name: "Tetris", classname: "tetris-badge-bg", id: "tetris" },
    { name: "Valorant", classname: "valorant-badge-bg", id: "valorant" },
    { name: "Minecraft", classname: "mc-badge-bg", id: "mc" },
    { name: "Fortnite", classname: "fn-badge-bg", id: "fn" },
    { name: "VgDev", classname: "vg-badge-bg", id: "vg" },
  ],
};

// use to check ids for lock/unlock
const checkId = (id: string): string => {
  return id.toLowerCase().replace(/[\s_-]/g, "");
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["none"]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(["none"]);

  const { user } = useUser();
  console.log("PlayerCard user:", user);
  const { player, loading: isLoading } = useCurrentPlayer(user?.id);

  // Load saved profile
  useEffect(() => {
    const savedProfile = () => {
      try {
        const savedThemeJson = localStorage.getItem("playerCard");
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
        bgCard,
      };

      try {
        localStorage.setItem("playerCard", JSON.stringify(save));
      } catch (error) {
        console.error("Error saving:", error);
      }
    }
  }, [background, borderStyle, badges, bgColor, bgCard, profileLoaded]);

  useEffect(() => {
    const unlockedThemesList = ["none"];
    const unlockedBadgesList = ["none"];

    for (const game of player?.participation || []) {
      const id = checkId(game).toLowerCase();

      if (id === "valorant") {
        unlockedThemesList.push("valorant");
        unlockedBadgesList.push("valorant");
      }
      if (id === "counterstrike2") {
        unlockedThemesList.push("cs2");
        unlockedBadgesList.push("cs2");
      }
      if (id === "rocketleague") {
        unlockedThemesList.push("rocket_league");
        unlockedBadgesList.push("mk");
      }
      if (id === "apexlegends") {
        unlockedThemesList.push("apex");
        unlockedBadgesList.push("apex");
      }
      if (id === "overwatch2") {
        unlockedThemesList.push("ow2");
        unlockedBadgesList.push("ow2");
      }
      if (id === "marvelrivals") {
        unlockedThemesList.push("rival");
        unlockedBadgesList.push("marvel");
      }
      if (id === "leagueoflegends") {
        unlockedThemesList.push("league");
        unlockedBadgesList.push("league");
      }

      if (id === "beatsaber") unlockedBadgesList.push("beat saber");
      if (id === "geoguessr") unlockedBadgesList.push("geo");
      if (id === "guiltygearstrive") unlockedBadgesList.push("gg");
      if (id === "rainbow6siege") unlockedBadgesList.push("r6");
      if (id === "smashultimate") unlockedBadgesList.push("smash");
      if (id === "streetfighter 6") unlockedBadgesList.push("street");
      if (id === "supercell") unlockedBadgesList.push("supercell");
      if (id === "teamfighttactics") unlockedBadgesList.push("tft");
      if (id === "tetris") unlockedBadgesList.push("tetris");
      if (id === "minecraft") unlockedBadgesList.push("mc");
      if (id === "fortnite") unlockedBadgesList.push("fn");
      if (id === "vgdev") unlockedBadgesList.push("vg");
      if (id === "osu!") unlockedBadgesList.push("osu");
    }

    setUnlockedThemes(unlockedThemesList);
    setUnlockedBadges(unlockedBadgesList);
  }, [player?.participation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        badgeRef.current &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        if (tab === "badges") {
          setTab("background");
          setActiveBadge(null);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [tab]);

  const handleThemeSelection = (
    themeType: ThemeCategory,
    theme: ThemeOption,
    badgeIndex?: number
  ) => {
    if (themeType === "background") {
      if (theme.id && !unlockedThemes.includes(theme.id)) {
        return;
      }
      setBackground(theme.classname);
      setBgColor(theme.bgColor || "");
    } else if (themeType === "badges" && badgeIndex !== undefined) {
      // Check if badge is unlocked before applying
      if (theme.id && !unlockedBadges.includes(theme.id)) {
        return;
      }
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

  // Check if a theme is locked
  const isLocked = (theme: ThemeOption): boolean => {
    if (!theme.id) return false;

    if (tab === "background") {
      return !unlockedThemes.includes(theme.id);
    } else if (tab === "badges") {
      return !unlockedBadges.includes(theme.id);
    }

    return false;
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        <div
          className={`${background} relative h-[500px] w-full rounded-xl bg-cover bg-center transition-all duration-500 ease-in-out`}
          style={{
            backgroundColor: bgColor || "transparent",
            backgroundBlendMode: "screen",
          }}
        >
          <div className="flex h-[400px] justify-center pt-6">
            {/* Player Card */}
            <div
              className={`mt-16 flex h-[300px] w-[340px] flex-col items-center justify-center space-y-8 rounded-xl ${borderStyle}`}
            >
              <div
                className={`flex flex-col items-center justify-center rounded-tl-lg rounded-tr-lg ${bgCard} px-4 text-white`}
                style={{
                  width: "320px",
                  height: "150px",
                  clipPath:
                    "polygon(0 0, 0 70%, 20% 100%, 80% 100%, 100% 70%, 100% 100%, 100% 0)",
                }}
              >
                {/* Display user name and token */}
                {isLoading ? (
                  <p className="animate-pulse text-gray-400">
                    Loading player data...
                  </p>
                ) : (
                  <div className="text-center">
                    <p className="font-bayon text-4xl">{player?.name}</p>
                    <p className="font-bayon text-xl text-[#eecf5d]">
                      TOKENS: {player ? player.points : "N/A"}
                    </p>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div
                ref={badgeRef}
                className={`flex w-[320px] justify-center space-x-6 ${bgCard} rounded-xl py-6`}
              >
                {badges.map((badge, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTab("badges");
                      setActiveBadge(index);
                    }}
                    className={`flex h-12 w-12 items-center justify-center rounded border-2 transition
                    ${
                      badge || badge === ""
                        ? `${badge}`
                        : "border-2 text-gray-200 hover:bg-gray-700"
                    } 
                    ${
                      activeBadge === index ? "border-b-4 border-tech-gold" : ""
                    } duration-1000 ease-in-out`}
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
              <div className="h-full w-full rounded-2xl border border-white/20 bg-opacity-50 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] p-4 shadow-lg">
                <button
                  onClick={() => setPanelOpen(false)}
                  className="ml-auto flex h-[20px] w-[20px] items-center justify-center rounded-xl bg-tech-gold p-4 font-bold text-white"
                >
                  <div>
                    <FaMinus />
                  </div>
                </button>

                {/* Tabs */}
                <div className="mb-4 flex justify-center space-x-4">
                  {Object.keys(themes).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key !== "badges" || activeBadge !== null) {
                          setTab(key as ThemeCategory);
                        }
                      }}
                      className={`rounded px-4 py-2 font-bayon text-lg text-white 
                        ${tab === key ? "bg-tech-gold" : "bg-transparent"} 
                        ${
                          key === "badges" && activeBadge === null
                            ? "cursor-not-allowed text-gray-500"
                            : ""
                        }`}
                      disabled={key === "badges" && activeBadge === null}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
                {/* Content */}
                <div className="grid max-h-[100px] grid-cols-4 gap-4 overflow-y-auto pr-2">
                  {themes[tab].map((theme, index) => {
                    const locked = isLocked(theme);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!locked) {
                            if (tab === "badges" && activeBadge !== null) {
                              handleThemeSelection(
                                "badges",
                                theme,
                                activeBadge
                              );
                            } else if (tab === "borders") {
                              handleThemeSelection("borders", theme);
                            } else if (tab === "background") {
                              handleThemeSelection("background", theme);
                            } else if (tab === "card") {
                              handleThemeSelection("card", theme);
                            }
                          }
                        }}
                        className={`h-[100px] w-[100px] rounded border p-4 text-lg ${
                          theme.classname
                        } relative font-bayon
                          ${
                            theme.name === "None"
                              ? "border-2 border-gray-700"
                              : ""
                          }
                          ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={locked}
                      >
                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center rounded bg-black bg-opacity-30">
                            <FaLock className="text-2xl text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-32 flex rounded-2xl border-t border-white/20 bg-opacity-50 bg-gradient-to-br from-[#2e1d1d] to-[#101c3b] p-4 shadow-lg">
                <button
                  onClick={() => setPanelOpen(true)}
                  className="ml-auto flex h-[20px] w-[20px] items-center justify-center rounded-xl bg-tech-gold p-4 text-white"
                >
                  <div>
                    <FaPlus />
                  </div>
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
