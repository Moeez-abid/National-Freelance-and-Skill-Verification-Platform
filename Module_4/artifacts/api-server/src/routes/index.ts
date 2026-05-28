import { Router, type IRouter } from "express";
import healthRouter from "./health";
import freelancersRouter from "./freelancers";
import projectsRouter from "./projects";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/freelancers", freelancersRouter);
router.use("/projects", projectsRouter);

export default router;
