export type GameTeam = {
    name: string;
    players: string[];
};

export type Game = {
    name: string;
    teams: GameTeam[];
};

export type UpdateGameInput = {
    name?: string;
    teams?: Array<{ name: string }>;
};
