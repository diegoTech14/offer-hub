import { getClientTaskRecords } from "@/controllers/task.controller";
import { Router } from "express";

const router = Router();

router.get("/client/:clientId", getClientTaskRecords); // Controller to get tasks records by client id

export default router;