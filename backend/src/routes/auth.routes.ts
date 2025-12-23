/**
 * @fileoverview Authentication routes for user login, registration, and token management
 * @author Offer Hub Team
 */

import {
  getNonce,
  login,
  logout,
  me,
  refresh,
  register,
  registerWithEmail,
  registerWithWallet,
  loginWithEmail,
  getSessions,
  deactivateSession,
} from "@/controllers/auth.controller";
import {
  authenticateToken,
  validateRefreshToken,
} from "@/middlewares/auth.middleware";
import { authLimiter } from "@/middlewares/ratelimit.middleware";
import { Router } from "express";

const router = Router();

// Registration routes
router.post("/register", authLimiter, register); // Email/password registration with invisible wallet
router.post("/register-with-email", authLimiter, registerWithEmail); // Email/password registration with invisible wallet
router.post("/register-with-wallet", authLimiter, registerWithWallet); // External wallet registration with email/password

// Authentication routes
router.post("/nonce", authLimiter, getNonce);
router.post("/login", authLimiter, login);
router.post("/login/email", authLimiter, loginWithEmail);

// Token management
router.post("/refresh", validateRefreshToken, refresh);
router.post("/logout", validateRefreshToken, logout);

// User routes
router.get("/me", authenticateToken(), me);
router.get("/sessions", authenticateToken(), getSessions);
router.delete("/sessions/:sessionId", authenticateToken(), deactivateSession);

export default router;
