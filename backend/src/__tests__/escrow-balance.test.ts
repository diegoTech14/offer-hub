import request from "supertest";
import express from "express";

// Mock auth middleware before importing it to prevent Supabase initialization
jest.mock("../middlewares/auth.middleware", () => ({
  authenticateToken: () => (req: any, res: any, next: any) => {
    req.user = { id: "test-user-id" };
    next();
  },
}));

import escrowBalanceRoutes from "../routes/escrow-balance.routes";
import { ErrorHandler } from "../utils/AppError";
import axios from "axios";
import { authenticateToken } from "../middlewares/auth.middleware";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.isAxiosError.mockImplementation(
  (payload) => payload.isAxiosError === true,
);

const app = express();
app.set("query parser", "extended");
app.use(express.json());
app.use("/api/escrows", authenticateToken(), escrowBalanceRoutes);
app.use(ErrorHandler);

describe("GET /api/escrows/balances", () => {
  beforeEach(() => {
    process.env.TRUSTLESSWORK_API_KEY = "test-key";
    process.env.TRUSTLESSWORK_API_URL = "https://api.test.com";
    jest.clearAllMocks();
  });

  const ADDR1 = "0".repeat(56);
  const ADDR2 = "1".repeat(56);
  const ADDR3 = "2".repeat(54); // Invalid 56 char string

  it("should return balances on success with single address", async () => {
    const mockBalances = [{ address: ADDR1, balance: "100.00" }];

    mockedAxios.get.mockResolvedValueOnce({
      data: mockBalances,
    });

    const res = await request(app)
      .get("/api/escrows/balances")
      .query({ "addresses[]": ADDR1 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ balances: mockBalances });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.test.com/helper/get-multiple-escrow-balance",
      {
        params: { addresses: [ADDR1] },
        headers: { "x-api-key": "test-key" },
      },
    );
  });

  it("should return balances on success with multiple addresses", async () => {
    const mockBalances = [
      { address: ADDR1, balance: "100.00" },
      { address: ADDR2, balance: "200.00" },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: mockBalances,
    });

    const res = await request(app)
      .get("/api/escrows/balances")
      .query({ "addresses[]": [ADDR1, ADDR2] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ balances: mockBalances });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.test.com/helper/get-multiple-escrow-balance",
      {
        params: { addresses: [ADDR1, ADDR2] },
        headers: { "x-api-key": "test-key" },
      },
    );
  });

  it("should return 422 on validation error (non-array addresses)", async () => {
    const res = await request(app)
      .get("/api/escrows/balances")
      .query({ addresses: ADDR1 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 422 on validation error (missing addresses)", async () => {
    const res = await request(app).get("/api/escrows/balances");

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 422 on validation error (invalid addreess)", async () => {
    const res = await request(app)
      .get("/api/escrows/balances")
      .query({ "addresses[]": ADDR3 });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 500 if API Key is missing", async () => {
    delete process.env.TRUSTLESSWORK_API_KEY;

    const res = await request(app)
      .get("/api/escrows/balances")
      .query({ "addresses[]": ADDR1 });

    expect(res.status).toBe(500);
    expect(res.body.error.message).toContain("Missing TrustlessWork API Key");
  });

  it("should handle external API network errors", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    const res = await request(app)
      .get("/api/escrows/balances")
      .query({ "addresses[]": ADDR1 });

    expect(res.status).toBe(500);
    expect(res.body.error.message).toContain("Failed to get escrow balances");
  });
});
