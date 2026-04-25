import express from "express";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api", apiRouter);

  return app;
}

export const app = createApp();
