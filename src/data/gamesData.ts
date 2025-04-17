import league from "../assets/game-covers/league-of-legends-cover.png";
import tft from "../assets/game-covers/teamfight-tactics-cover.jpg";
import valorant from "../assets/game-covers/valorant-cover.jpeg";
import overwatch2 from "../assets/game-covers/overwatch-2-cover.jpeg";
import csgo2 from "../assets/game-covers/counter-strike-2-cover.jpeg";
import smash from "../assets/game-covers/smash-cover.jpeg";
import r6 from "../assets/game-covers/rainbow-six-siege-cover.jpeg";
import rythm from "../assets/game-covers/rythm-games-cover.jpeg";
import rl from "../assets/game-covers/rocket-league-cover.jpeg";
import apex from "../assets/game-covers/apex-cover.jpeg";
import guiltygear from "../assets/game-covers/guilty-gear-cover.jpg";
import streetfighter from "../assets/game-covers/street-fighter-cover.jpg";
import rivals from "../assets/game-covers/rivals-cover.jpg";

import minecraft from "../assets/game-covers/minecraft-cover.jpeg";
import fortnite from "../assets/game-covers/fortnite-cover.jpg";

import tetris from "../assets/game-covers/tetris-cover.jpg";
import beatsaber from "../assets/game-covers/beat-saber-cover.jpg";
import geoguessr from "../assets/game-covers/geoguessr-cover.jpg";
import supercell from "../assets/game-covers/supercell-cover.png";
import vgdev from "../assets/game-covers/vgdev-cover.png";

export const games = {
  "League of Legends": {
    image: league,
    pageLink: "event/gamefest-2025-league-of-legends-tournament",
    discordLink: "https://discord.gg/T3vB5jYhdE",
  },

  Valorant: {
    image: valorant,
    pageLink: "event/gamefest-2025-valorant-tournament",
    discordLink: "https://discord.gg/2aUxJuT",
  },
  "Overwatch 2": {
    image: overwatch2,
    pageLink: "event/gamefest-2025-overwatch-2-tournament",
    discordLink: "https://discord.com/invite/Q3s2dU9jEa",
  },
  "Rocket League": {
    image: rl,
    pageLink: "event/gamefest-2025-rocket-league-tournament",
    discordLink: "https://discord.gg/B9tQzuk8jh",
  },
  "CS 2": {
    image: csgo2,
    pageLink: "event/gamefest-2025-counter-strike-2-tournament",
    discordLink: "https://discord.gg/3FUjyXA",
  },
  Smash: {
    image: smash,
    pageLink: "event/gamefest-2025-smash-ultimate-singles",
    discordLink: "https://discord.gg/xpFgFyU",
  },
  "Mario Kart 8 Deluxe": {
    image: smash,
    pageLink: "event/gamefest-2025-mario-kart-8-deluxe-tournament",
    discordLink: "",
  },
  "Rainbow Six Siege": {
    image: r6,
    pageLink: "event/gamefest-2025-rainbow-six-siege-tournament",
    discordLink: "https://discord.gg/MPuJg5qws5",
  },
  "Apex Legends": {
    image: apex,
    pageLink: "event/gamefest-2025-apex-legends-tournament",
    discordLink: "https://discord.gg/hf4aHRHUTH",
  },
  "Guilty Gear": {
    image: guiltygear,
    pageLink: "event/gamefest-2025-guilty-gear-strive-tournament",
    discordLink: "",
  },
  "Street Fighter 6": {
    image: streetfighter,
    pageLink: "event/gamefest-2025-street-fighter-6-tournament",
    discordLink: "",
  },
  Rivals: {
    image: rivals,
    pageLink: "event/gamefest-2025-marvel-rivals-tournament",
    discordLink: "",
  }
};

export const casual_games = {
  Minecraft: {
    image: minecraft,
    pageLink: "event/gamefest-2025-minecraft-pvp-speedrun",
    discordLink: "https://discord.gg/QbeazDKCdM",
  },
  Fortnite: {
    image: fortnite,
    pageLink: "event/gamefest-2025-fortnite-solo-showdown",
    discordLink: "https://discord.gg/ZDmmynxYYM",
  },
};

export const challenges = {
  Tetris: {
    image: tetris,
    pageLink: "",
    discordLink: "https://discord.gg/JNgf2xC7",
  },
  "Beat Saber": {
    image: beatsaber,
    pageLink: "",
    discordLink: "",
  },
  "Teamfight Tactics": {
    image: tft,
    pageLink: "",
    discordLink: "",
  },
  GeoGuessr: {
    image: geoguessr,
    pageLink: "",
    discordLink: "",
  },
  Supercell: {
    image: supercell,
    pageLink: "",
    discordLink: "",
  },
  VGDev: {
    image: vgdev,
    pageLink: "",
    discordLink: "",
  },
}

export const gameCovers: { [key: string]: string } = {
  "league_of_legends": league,
  "teamfight_tactics": tft,
  "valorant": valorant,
  "overwatch_2": overwatch2,
  "rocket_league": rl,
  "counter_strike_2": csgo2,
  "smash": smash,
  "mario_kart": smash,
  "rainbow_six_seige": r6,
  "rythm": rythm,
  "apex_leagues": apex,
};
