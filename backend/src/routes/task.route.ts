import { getTaskRecordsByClientHandler } from "@/controllers/task.controller";
import { Router } from "express";

const router = Router();

router.get("/client/:clientId", getTaskRecordsByClientHandler); // Controller to get tasks records by client id

export default router;