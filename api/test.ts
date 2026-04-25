import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({
    ok: true,
    path: req.url,
    method: req.method,
    message: "Serverless function is working",
  });
}
