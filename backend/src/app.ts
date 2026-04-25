import express from "express";
import { apiRouter } from "./routes";

type ExpressApp = ReturnType<typeof express>;

export function createApp(): ExpressApp {
  const app = express();

  app.use(express.json());

  // Health check endpoints
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/startgg/health", (_req, res) => res.json({ ok: true }));

  // Mount API router:
  // - Local dev: frontend calls /api/startgg/* -> mounted at /api
  // - Vercel serverless: frontend calls /api/startgg/* but /api is stripped by routing -> mounted at /
  // So we mount at both to support both environments
  app.use("/api", apiRouter);
  app.use("/", apiRouter);

  return app;
}

export const app = createApp();