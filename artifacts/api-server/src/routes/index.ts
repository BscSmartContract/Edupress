import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import seriesRouter from "./series";
import classesRouter from "./classes";
import contentRouter from "./content";
import questionsRouter from "./questions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(seriesRouter);
router.use(classesRouter);
router.use(contentRouter);
router.use(questionsRouter);
router.use(dashboardRouter);

export default router;
