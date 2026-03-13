import express from "express";
import { apiRouter } from "./routes";
import { env } from "./config/env";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", apiRouter);

app.listen(env.port, () => console.log(`API listening on ${env.port}`));