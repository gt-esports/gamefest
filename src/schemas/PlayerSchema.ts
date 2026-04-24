export type TeamAssignment = {
    game: string;
    team: string;
};

// `name` is derived from the linked user's fname + lname (falls back to username).
// `username` is the Discord username from the linked user.
// Players are uniquely identified by their linked `userId`.
export type Player = {
    id: string;
    userId: string;
    name: string;
    username: string | null;
    points: number;
    participation: string[];
    log: string[];
    teamAssignments: TeamAssignment[];
    raffleWinner: boolean;
    rafflePlacing: number;
};

export type CreatePlayerInput = {
    userId: string;
    points?: number;
    participation?: string[];
    log?: string[];
    raffleWinner?: boolean;
    rafflePlacing?: number;
    teamAssignments?: TeamAssignment[];
};

export type UpdatePlayerInput = {
    points?: number;
    participation?: string[];
    log?: string[];
    raffleWinner?: boolean;
    rafflePlacing?: number;
    teamAssignments?: TeamAssignment[];
};
