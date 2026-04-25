import { Router } from "express";
import { fetchEventSets, fetchTournamentBySlug, fetchTournamentEventsBySlug } from "./startggService";

const apiRouter = Router();

apiRouter.get("/startgg/tournaments/:slug", async (req, res) => {
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

apiRouter.get("/startgg/tournaments/:slug/events", async (req, res) => {
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

apiRouter.get("/startgg/events/:eventId/sets", async (req, res) => {
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

// Health check
apiRouter.get("/health", (_req, res) => res.json({ ok: true }));

export { apiRouter };
