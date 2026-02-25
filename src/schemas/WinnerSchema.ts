export type WinnerRecord = {
    id: string;
    game: string;
    matchId: string;
    winner: string;
};

export type SaveWinnerInput = {
    game: string;
    matchId: string;
    winner: string;
};
