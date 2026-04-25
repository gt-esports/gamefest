import express from "express";
import { apiRouter } from "./app";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();
app.use(express.json());

// Mount API router with both paths for compatibility
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Health check endpoints
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
