import { Router } from "express";
import { logoutV1 } from "@/controllers/auth.controller";
import { authenticateToken } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/logout", authenticateToken(), logoutV1);

export default router;
