import express from "express";
import { apiRouter } from "./routes";

type ExpressApp = ReturnType<typeof express>;

export function createApp(): ExpressApp {
  const app = express();

  app.use(express.json());

  // Keep both probes so local dev and Vercel (/api/*) have a health endpoint.
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api", apiRouter);

  return app;
}

export const app = createApp();