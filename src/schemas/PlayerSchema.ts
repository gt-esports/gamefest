export type TeamAssignment = {
    game: string;
    team: string;
};

export type Player = {
    id: string;
    name: string;
    points: number;
    participation: string[];
    log: string[];
    teamAssignments: TeamAssignment[];
    raffleWinner: boolean;
    rafflePlacing: number;
    userId: string | null;
};

export type CreatePlayerInput = {
    name: string;
    points?: number;
    participation?: string[];
    log?: string[];
    raffleWinner?: boolean;
    rafflePlacing?: number;
    teamAssignments?: TeamAssignment[];
    userId?: string;
};

export type UpdatePlayerInput = {
    name?: string;
    points?: number;
    participation?: string[];
    log?: string[];
    raffleWinner?: boolean;
    rafflePlacing?: number;
    teamAssignments?: TeamAssignment[];
    userId?: string;
};
