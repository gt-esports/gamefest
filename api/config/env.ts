type Env = {
  port: number;
  startgg: {
    apiToken?: string;
    apiEndpoint: string;
  };
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env: Env = {
  port: toNumber(process.env.PORT, 3001),
  startgg: {
    apiToken: process.env.STARTGG_API_TOKEN || process.env.VITE_STARTGG_TOKEN,
    apiEndpoint:
      process.env.STARTGG_API_ENDPOINT || "https://api.start.gg/gql/alpha",
  },
};
