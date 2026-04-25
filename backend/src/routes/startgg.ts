import { Router } from "express";
import {
  fetchEventSets,
  fetchEventStandings,
  fetchEventWithPhases,
  fetchPhaseGroupSets,
  fetchPhaseGroupResults,
  fetchPhaseGroupSetRounds,
  fetchPhasePools,
  fetchPhaseSets,
  fetchTournamentBySlug,
  fetchTournamentEventsBySlug,
} from "../services/startggService";

const startggRouter = Router();

startggRouter.get("/tournaments/:slug", async (req, res) => {
  try {
    const tournament = await fetchTournamentBySlug(req.params.slug);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found or token missing" });
    }

    res.json({ tournament });
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/tournaments/:slug/events", async (req, res) => {
  try {
    const result = await fetchTournamentEventsBySlug(req.params.slug);

    if (!result) {
      return res.status(404).json({ message: "Tournament not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/events/:eventId/sets", async (req, res) => {
  const eventId = req.params.eventId;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 50);

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: "Invalid query param: page" });
  }
  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchEventSets({ eventId, page, perPage });
    if (!result) {
      return res.status(404).json({ message: "Event not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/events/:eventId/phases", async (req, res) => {
  const eventId = req.params.eventId;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 50);

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: "Invalid query param: page" });
  }
  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchEventWithPhases({ eventId, page, perPage });
    if (!result) {
      return res.status(404).json({ message: "Event not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/events/:eventId/standings", async (req, res) => {
  const eventId = req.params.eventId;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 50);

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: "Invalid query param: page" });
  }
  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchEventStandings({ eventId, page, perPage });
    if (!result) {
      return res.status(404).json({ message: "Event not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/phases/:phaseId/sets", async (req, res) => {
  const phaseId = req.params.phaseId;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 50);

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: "Invalid query param: page" });
  }
  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchPhaseSets({ phaseId, page, perPage });
    if (!result) {
      return res.status(404).json({ message: "Phase not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/phases/:phaseId/pools", async (req, res) => {
  const phaseId = req.params.phaseId;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 50);

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: "Invalid query param: page" });
  }
  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchPhasePools({ phaseId, page, perPage });
    if (!result) {
      return res.status(404).json({ message: "Phase not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/phase-groups/:phaseGroupId/sets", async (req, res) => {
  const phaseGroupId = req.params.phaseGroupId;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 50);

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: "Invalid query param: page" });
  }
  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchPhaseGroupSets({ phaseGroupId, page, perPage });
    if (!result) {
      return res.status(404).json({ message: "Phase group not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/phase-groups/:phaseGroupId/results", async (req, res) => {
  const phaseGroupId = req.params.phaseGroupId;
  const perPage = Number(req.query.perPage ?? 100);

  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const result = await fetchPhaseGroupResults({ phaseGroupId, perPage });
    if (!result) {
      return res.status(404).json({ message: "Phase group not found or token missing" });
    }

    res.json(result);
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

startggRouter.get("/phase-groups/:phaseGroupId/sets/grouped", async (req, res) => {
  const phaseGroupId = req.params.phaseGroupId;
  const perPage = Number(req.query.perPage ?? 100);

  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: "Invalid query param: perPage (1-100)" });
  }

  try {
    const [roundsResult, setsResult] = await Promise.all([
      fetchPhaseGroupSetRounds({ phaseGroupId, perPage }),
      fetchPhaseGroupSets({ phaseGroupId, page: 1, perPage }),
    ]);

    if (!roundsResult || !setsResult) {
      return res.status(404).json({ message: "Phase group not found or token missing" });
    }

    const roundsById = new Map<string, any>((roundsResult.nodes ?? []).map((n) => [String(n.id), n]));

    const merged = (setsResult.nodes ?? []).map((s) => {
      const id = String((s as any).id);
      const r = roundsById.get(id);
      return {
        ...s,
        fullRoundText: r?.fullRoundText ?? null,
        identifier: r?.identifier ?? null,
        round: r?.round ?? null,
        stream: r?.stream ?? null,
      } as any;
    });

    const texts = merged.map((m: any) => (m.fullRoundText ? String(m.fullRoundText).trim() : "")).filter((t: string) => t.length > 0);

    const unique = Array.from(new Set(texts));
    const containsWinnersOrLosers = unique.some((t) => /\b(Winners|Losers)\b/i.test(t));

    if (containsWinnersOrLosers) {
      const groups = unique.map((txt) => ({
        round: txt,
        sets: merged.filter((m: any) => ((m.fullRoundText ?? "").trim() === txt)),
      }));

      return res.json({ phaseGroupId: roundsResult.phaseGroupId, groups, containsWinnersOrLosers });
    }

    return res.json({ phaseGroupId: roundsResult.phaseGroupId, sets: merged, containsWinnersOrLosers });
  } catch (error) {
    console.error("start.gg fetch error", error);
    res.status(500).json({ message: "Failed to fetch start.gg data" });
  }
});

export { startggRouter };
