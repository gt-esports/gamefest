export type GameTeam = {
    name: string;
    players: string[];
};

export type Game = {
    id: string;
    name: string;
    pointsPerAward: number;
    maxPoints: number;
    teams: GameTeam[];
};

export type UpdateGameInput = {
    name?: string;
    teams?: Array<{ name: string }>;
    pointsPerAward?: number;
    maxPoints?: number;
};
