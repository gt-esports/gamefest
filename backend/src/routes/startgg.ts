import { Router } from "express";
import { fetchTournamentBySlug } from "../services/startggService";

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

export { startggRouter };
