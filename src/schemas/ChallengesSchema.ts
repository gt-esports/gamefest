export type Challenge = {
  id: string;
  name: string;
  pointsPerAward: number;
  maxPoints: number;
};

export type CreateChallengeInput = {
  name: string;
  pointsPerAward?: number;
  maxPoints?: number;
};

export type UpdateChallengeInput = {
  name?: string;
  pointsPerAward?: number;
  maxPoints?: number;
};
