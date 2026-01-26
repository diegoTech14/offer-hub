/**
 * @fileoverview Authentication routes for user login, registration, and token management
 * @author Offer Hub Team
 */

import {
  getNonce,
  login,
  loginWithWallet,
  logout,
  me,
  refresh,
  register,
  registerWithEmail,
  registerWithWallet,
  loginWithEmail,
  getSessions,
  revokeSession,
  forgotPassword,
  resetPassword,
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
router.post("/login", authLimiter, login); // Email/password login
router.post("/login/wallet", authLimiter, loginWithWallet); // Wallet login (signature)
router.post("/login/email", authLimiter, loginWithEmail); // Alias for email/password login

// Token management
router.post("/refresh", validateRefreshToken, refresh);
router.post("/logout", validateRefreshToken, logout);

// Password recovery routes
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// User routes
router.get("/me", authenticateToken(), me);
router.get("/sessions", authenticateToken(), getSessions);

// Revoke Session Route
router.delete("/sessions/:id", authenticateToken(), revokeSession);

export default router;
