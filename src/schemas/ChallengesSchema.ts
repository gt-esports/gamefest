export type Challenge = {
  id: string;
  name: string;
  maxPoints: number;
};

export type CreateChallengeInput = {
  name: string;
  maxPoints?: number;
};

export type UpdateChallengeInput = {
  name?: string;
  maxPoints?: number;
};
