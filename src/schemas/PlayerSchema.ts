export type TeamAssignment = {
    game: string;
    team: string;
};

// `name` is a derived display name from the linked user (display_name || username).
// Players are uniquely identified by their linked `userId`.
export type Player = {
    id: string;
    userId: string;
    name: string;
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
