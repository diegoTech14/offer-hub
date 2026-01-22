import { Router } from "express";
import { createProfileHandler } from "@/controllers/profile.controller";

const router = Router();

// POST /api/profile - Create profile for authenticated user
router.post("/", createProfileHandler);

export default router;
