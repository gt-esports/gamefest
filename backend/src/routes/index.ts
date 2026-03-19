import { Router } from "express";
import { startggRouter } from "./startgg";

const apiRouter = Router();

apiRouter.use("/startgg", startggRouter);

export { apiRouter };
