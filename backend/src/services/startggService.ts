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

export type EventPhaseGroupNode = { id: string | number };
export type EventPhase = {
  id: string | number;
  name: string;
  phaseGroups: { nodes: EventPhaseGroupNode[] } | null;
};

export type PhaseSetSlot = {
  id: string | number;
  entrant: { id: string | number; name: string } | null;
  standing: { stats: { score: { value: number | null } | null } | null } | null;
};
export type PhaseSetNode = { id: string | number; slots: PhaseSetSlot[] };

export type PhaseGroupNode = { id: string | number; displayIdentifier: string | null };
export type PhaseGroupSetSlot = {
  id: string | number;
  entrant: { id: string | number; name: string } | null;
  standing: { stats: { score: { value: number | null } | null } | null } | null;
};
export type PhaseGroupSetNode = { id: string | number; slots: PhaseGroupSetSlot[] };

export type EventStandingNode = {
  placement: number;
  entrant: { id: string | number; name: string } | null;
};

export type PhaseGroupResultSlot = {
  entrant: { id: string | number; name: string } | null;
};
export type PhaseGroupResultNode = {
  id: string | number;
  winnerId: string | number | null;
  slots: PhaseGroupResultSlot[];
};

export type PhaseGroupSetRoundNode = {
  id: string | number;
  identifier?: string | null;
  round?: number | null;
  fullRoundText?: string | null;
  stream?: { streamName?: string | null } | null;
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

export async function fetchEventWithPhases(params: {
  eventId: string | number;
  page: number;
  perPage: number;
}): Promise<
  | {
      eventId: string | number;
      phases: Array<{ id: string | number; name: string; phaseGroupIds: Array<string | number> }>;
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query EventWithPhases($eventId: ID!, $page: Int!, $perPage: Int!) {
      event(id: $eventId) {
        phases {
          id
          name
          phaseGroups(query: { page: $page, perPage: $perPage }) {
            nodes {
              id
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
            phases: EventPhase[] | null;
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
    eventId: params.eventId,
    phases: (event.phases ?? []).map((phase) => ({
      id: phase.id,
      name: phase.name,
      phaseGroupIds: phase.phaseGroups?.nodes?.map((n) => n.id) ?? [],
    })),
  };
}

export async function fetchPhaseSets(params: {
  phaseId: string | number;
  page: number;
  perPage: number;
}): Promise<
  | {
      phaseId: string | number;
      phaseName: string;
      total: number;
      nodes: PhaseSetNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query PhaseSets($phaseId: ID!, $page: Int!, $perPage: Int!) {
      phase(id: $phaseId) {
        id
        name
        sets(page: $page, perPage: $perPage, sortType: STANDARD) {
          pageInfo { total }
          nodes {
            id
            slots {
              id
              entrant { id name }
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
      phase:
        | {
            id: string | number;
            name: string;
            sets: { pageInfo: { total: number }; nodes: PhaseSetNode[] } | null;
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

  const phase = response.data.data?.phase ?? null;
  if (!phase) return null;

  return {
    phaseId: phase.id,
    phaseName: phase.name,
    total: phase.sets?.pageInfo?.total ?? 0,
    nodes: phase.sets?.nodes ?? [],
  };
}

export async function fetchPhasePools(params: {
  phaseId: string | number;
  page: number;
  perPage: number;
}): Promise<
  | {
      phaseId: string | number;
      phaseName: string;
      phaseGroups: PhaseGroupNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query PhasePools($phaseId: ID!, $page: Int!, $perPage: Int!) {
      phase(id: $phaseId) {
        id
        name
        phaseGroups(query: { page: $page, perPage: $perPage }) {
          nodes {
            id
            displayIdentifier
          }
        }
      }
    }
  `;

  const response = await client.post<
    StartggGraphQLResponse<{
      phase:
        | {
            id: string | number;
            name: string;
            phaseGroups: { nodes: PhaseGroupNode[] } | null;
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

  const phase = response.data.data?.phase ?? null;
  if (!phase) return null;

  return {
    phaseId: phase.id,
    phaseName: phase.name,
    phaseGroups: phase.phaseGroups?.nodes ?? [],
  };
}

export async function fetchPhaseGroupSets(params: {
  phaseGroupId: string | number;
  page: number;
  perPage: number;
}): Promise<
  | {
      phaseGroupId: string | number;
      displayIdentifier: string | null;
      total: number;
      nodes: PhaseGroupSetNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query PhaseGroupSets($phaseGroupId: ID!, $page: Int!, $perPage: Int!) {
      phaseGroup(id: $phaseGroupId) {
        id
        displayIdentifier
        sets(page: $page, perPage: $perPage, sortType: STANDARD) {
          pageInfo { total }
          nodes {
            id
            slots {
              id
              entrant { id name }
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
      phaseGroup:
        | {
            id: string | number;
            displayIdentifier: string | null;
            sets: { pageInfo: { total: number }; nodes: PhaseGroupSetNode[] } | null;
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

  const phaseGroup = response.data.data?.phaseGroup ?? null;
  if (!phaseGroup) return null;

  return {
    phaseGroupId: phaseGroup.id,
    displayIdentifier: phaseGroup.displayIdentifier ?? null,
    total: phaseGroup.sets?.pageInfo?.total ?? 0,
    nodes: phaseGroup.sets?.nodes ?? [],
  };
}

export async function fetchEventStandings(params: {
  eventId: string | number;
  page: number;
  perPage: number;
}): Promise<
  | {
      eventId: string | number;
      eventName: string;
      nodes: EventStandingNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) {
      event(id: $eventId) {
        id
        name
        standings(query: { perPage: $perPage, page: $page }) {
          nodes {
            placement
            entrant { id name }
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
            standings: { nodes: EventStandingNode[] } | null;
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
    nodes: event.standings?.nodes ?? [],
  };
}

export async function fetchPhaseGroupResults(params: {
  phaseGroupId: string | number;
  perPage: number;
}): Promise<
  | {
      phaseGroupId: string | number;
      nodes: PhaseGroupResultNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const query = `
    query Sets($phaseGroupId: ID!, $perPage: Int!) {
      phaseGroup(id: $phaseGroupId) {
        sets(perPage: $perPage) {
          nodes {
            id
            winnerId
            slots {
              entrant { id name }
            }
          }
        }
      }
    }
  `;

  const response = await client.post<
    StartggGraphQLResponse<{
      phaseGroup:
        | {
            sets: { nodes: PhaseGroupResultNode[] } | null;
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

  const phaseGroup = response.data.data?.phaseGroup ?? null;
  if (!phaseGroup) return null;

  return {
    phaseGroupId: params.phaseGroupId,
    nodes: phaseGroup.sets?.nodes ?? [],
  };
}

export async function fetchPhaseGroupSetRounds(params: {
  phaseGroupId: string | number;
  perPage?: number;
}): Promise<
  | {
      phaseGroupId: string | number;
      nodes: PhaseGroupSetRoundNode[];
    }
  | null
> {
  if (!env.startgg.apiToken) return null;

  const perPage = params.perPage ?? 100;

  const query = `
    query Sets($phaseGroupId: ID!, $perPage: Int!) {
      phaseGroup(id: $phaseGroupId) {
        sets(perPage: $perPage) {
          nodes {
            id
            identifier
            round
            fullRoundText
            stream { streamName }
          }
        }
      }
    }
  `;

  const response = await client.post<
    StartggGraphQLResponse<{
      phaseGroup:
        | {
            sets: { nodes: PhaseGroupSetRoundNode[] } | null;
          }
        | null;
    }>
  >("", {
    query,
    variables: { phaseGroupId: params.phaseGroupId, perPage },
  });

  if (response.data.errors && response.data.errors.length > 0) {
    const errorMessages = response.data.errors.map((err) => err.message).join(", ");
    throw new Error(`start.gg error: ${errorMessages}`);
  }

  const phaseGroup = response.data.data?.phaseGroup ?? null;
  if (!phaseGroup) return null;

  return {
    phaseGroupId: params.phaseGroupId,
    nodes: phaseGroup.sets?.nodes ?? [],
  };
}
