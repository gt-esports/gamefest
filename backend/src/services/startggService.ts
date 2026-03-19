import axios from "axios";
import { env } from "../config/env";

type StartggGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type Tournament = {
  id: number;
  name: string;
  startAt: number;
  endAt: number | null;
  city?: string | null;
  countryCode?: string | null;
};

const client = axios.create({
  baseURL: env.startgg.apiEndpoint,
  headers: {
    "Content-Type": "application/json",
    Authorization: env.startgg.apiToken ? `Bearer ${env.startgg.apiToken}` : undefined,
  },
});

export async function fetchTournamentBySlug(slug: string): Promise<Tournament | null> {
  if (!env.startgg.apiToken) {
    // Without token, return null so caller can respond meaningfully.
    return null;
  }

  const query = `
    query TournamentBySlug($slug: String!) {
      tournament(slug: $slug) {
        id
        name
        startAt
        endAt
        city
        countryCode
      }
    }
  `;

  const response = await client.post<StartggGraphQLResponse<{ tournament: Tournament | null }>>("", {
    query,
    variables: { slug },
  });

  if (response.data.errors && response.data.errors.length > 0) {
    const errorMessages = response.data.errors.map((err) => err.message).join(", ");
    throw new Error(`start.gg error: ${errorMessages}`);
  }

  return response.data.data?.tournament ?? null;
}
