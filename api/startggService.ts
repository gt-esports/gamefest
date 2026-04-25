import axios from "axios";
import { env } from "./env";

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

export type TournamentEvent = {
  id: string | number;
  name: string;
};

export type EventSetSlot = {
  entrant: { name: string } | null;
  standing: { stats: { score: { value: number | null } | null } | null } | null;
};

export type EventSetNode = {
  id: string | number;
  slots: EventSetSlot[];
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

export async function fetchTournamentEventsBySlug(slug: string): Promise<{
  tournamentId: string | number;
  tournamentName: string;
  events: TournamentEvent[];
} | null> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query TournamentEvents($tourneySlug: String!) {
      tournament(slug: $tourneySlug) {
        id
        name
        events {
          id
          name
        }
      }
    }
  `;

  const response = await client.post<
    StartggGraphQLResponse<{ tournament: { id: string | number; name: string; events: TournamentEvent[] } | null }>
  >("", {
    query,
    variables: { tourneySlug: slug },
  });

  if (response.data.errors && response.data.errors.length > 0) {
    const errorMessages = response.data.errors.map((err) => err.message).join(", ");
    throw new Error(`start.gg error: ${errorMessages}`);
  }

  const tournament = response.data.data?.tournament ?? null;
  if (!tournament) return null;

  return {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    events: tournament.events ?? [],
  };
}

export async function fetchEventSets(params: {
  eventId: string | number;
  page: number;
  perPage: number;
}): Promise<
  | {
      eventId: string | number;
      eventName: string;
      nodes: EventSetNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
      event(id: $eventId) {
        id
        name
        sets(page: $page, perPage: $perPage, sortType: STANDARD) {
          nodes {
            id
            slots {
              entrant { name }
              standing {
                stats {
                  score { value }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await client.post<
    StartggGraphQLResponse<{
      event:
        | {
            id: string | number;
            name: string;
            sets: { nodes: EventSetNode[] } | null;
          }
        | null;
    }>
  >("", {
    query,
    variables: params,
  });

  if (response.data.errors && response.data.errors.length > 0) {
    const errorMessages = response.data.errors.map((err) => err.message).join(", ");
    throw new Error(`start.gg error: ${errorMessages}`);
  }

  const event = response.data.data?.event ?? null;
  if (!event) return null;

  return {
    eventId: event.id,
    eventName: event.name,
    nodes: event.sets?.nodes ?? [],
  };
}
