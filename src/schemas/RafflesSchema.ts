export type RaffleParticipant = {
    userId: string;
    name: string;
    points: number;
};

export type RaffleWinner = RaffleParticipant & {
    place: string;
};

export type PickRaffleWinnersInput = {
    count: number;
};
