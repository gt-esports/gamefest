import fs from "fs";
import path from "path";
import axios from "axios";
import { env } from "../config/env";

// This script can be run manually: npm run gform:run
// It fetches Google Form responses via Sheets API (if API key + sheet ID are set) and writes them to a JSON file
// under env.googleForm.outputPath. Replace the fetch logic with whatever data format the team prefers.

type FormResponseRow = Record<string, string>;

type GoogleSheetsResponse = {
  values?: string[][];
};

async function fetchResponses(): Promise<FormResponseRow[]> {
  if (!env.googleForm.spreadsheetId || !env.googleForm.apiKey) {
    console.warn("Google Form credentials missing; returning empty response set.");
    return [];
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.googleForm.spreadsheetId}/values/Sheet1?key=${env.googleForm.apiKey}`;
  const response = await axios.get<GoogleSheetsResponse>(url);

  const rows = response.data.values ?? [];
  const [headers, ...dataRows] = rows;
  if (!headers) return [];

  return dataRows.map((row) => {
    const obj: FormResponseRow = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] ?? "";
    });
    return obj;
  });
}

async function writeResponsesToFile(responses: FormResponseRow[]): Promise<void> {
  const outputPath = path.resolve(env.googleForm.outputPath);
  const dir = path.dirname(outputPath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(outputPath, JSON.stringify({ responses, updatedAt: new Date().toISOString() }, null, 2));
}

async function main() {
  try {
    const responses = await fetchResponses();
    await writeResponsesToFile(responses);
    console.log(`Saved ${responses.length} form responses to ${env.googleForm.outputPath}`);
  } catch (error) {
    console.error("Failed to ingest Google Form responses", error);
    process.exitCode = 1;
  }
}

void main();
