import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

jest.mock("@/middlewares/auth.middleware", () => {
  const { AppError } = require("@/utils/AppError");

  return {
    authenticateToken: () => (req: any, _res: any, next: any) => {
      const auth = req.headers.authorization;
      if (!auth) {
        return next(new AppError("Authentication required", 401));
      }
      req.user = { id: "user-123" };
      next();
    },
  };
});

jest.mock("@/services/auth.service", () => ({
  logoutAllUserSessions: jest.fn(),
  logoutCurrentSession: jest.fn(),
}));

import authV1Routes from "@/routes/auth.v1.routes";
import { errorHandlerMiddleware } from "@/middlewares/errorHandler.middleware";
import * as authService from "@/services/auth.service";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1/auth", authV1Routes);
app.use(errorHandlerMiddleware);

describe("POST /api/v1/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if unauthorized", async () => {
    const res = await request(app).post("/api/v1/auth/logout").send({});

    expect(res.status).toBe(401);
  });

  it("revokes the current refresh token and returns 200", async () => {
    (authService.logoutCurrentSession as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", "Bearer test")
      .set("Cookie", ["refreshToken=refresh-token-value"])
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Logged out successfully",
    });

    expect(authService.logoutCurrentSession).toHaveBeenCalledWith(
      "user-123",
      expect.objectContaining({
        refreshToken: "refresh-token-value",
      }),
    );
  });

  it("revokes all sessions when logout_all=true", async () => {
    (authService.logoutAllUserSessions as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", "Bearer test")
      .send({ logout_all: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Logged out successfully",
    });

    expect(authService.logoutAllUserSessions).toHaveBeenCalledWith("user-123");
  });
});
