import dotenv from "dotenv";

dotenv.config();

type Env = {
  port: number;
  startgg: {
    apiToken?: string;
    apiEndpoint: string;
  };
  googleForm: {
    // Identifier for the Google Form/Sheet used as source.
    spreadsheetId?: string;
    apiKey?: string;
    outputPath: string;
  };
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env: Env = {
  port: toNumber(process.env.PORT, 3000),
  startgg: {
    apiToken: process.env.STARTGG_API_TOKEN,
    apiEndpoint: process.env.STARTGG_API_ENDPOINT || "https://api.start.gg/gql/alpha",
  },
  googleForm: {
    spreadsheetId: process.env.GOOGLE_FORM_SPREADSHEET_ID,
    apiKey: process.env.GOOGLE_FORM_API_KEY,
    outputPath: process.env.GOOGLE_FORM_OUTPUT_PATH || "data/google-form.json",
  },
};

if (!env.startgg.apiToken) {
  // Warn so the teammate knows to set credentials before testing calls.
  console.warn("Warning: STARTGG_API_TOKEN not set. Start.gg requests will be unauthorized.");
}
