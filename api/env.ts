import dotenv from "dotenv";

dotenv.config();

export const env = {
  startgg: {
    apiToken: process.env.STARTGG_API_TOKEN || process.env.VITE_STARTGG_TOKEN,
    apiEndpoint: process.env.STARTGG_API_ENDPOINT || "https://api.start.gg/gql/alpha",
  },
};

if (!env.startgg.apiToken) {
  console.warn("Warning: STARTGG_API_TOKEN not set. Start.gg requests will be unauthorized.");
}
