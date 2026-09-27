import dotenv from "dotenv";
import path from "path";

dotenv.config();
// Also load root .env.local so STARTGG_API_TOKEN can live alongside other secrets
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local"), override: false });
dotenv.config({ path: path.resolve(process.cwd(), "../.env"), override: false });

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
    apiEndpoint: process.env.STARTGG_API_ENDPOINT || "https://api.start.gg/gql/alpha",
  },
};

if (!env.startgg.apiToken) {
  console.warn("Warning: STARTGG_API_TOKEN not set. Start.gg requests will be unauthorized.");
}
