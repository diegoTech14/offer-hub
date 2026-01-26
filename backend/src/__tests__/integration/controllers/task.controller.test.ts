// src/__tests__/integration/controllers/task.controller.test.ts
import { getTaskRecordsByClientHandler } from "@/controllers/task.controller";
import * as taskService from "@/services/task.service";
import { BadRequestError } from "@/utils/AppError";

jest.mock("@/services/task.service");
const mockTaskService = taskService as jest.Mocked<typeof taskService>;

describe("getTaskRecordsByClientHandler (controller)", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockClientId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  const sampleRows = [
    {
      id: "1",
      client_id: mockClientId,
      project_title: "Project A",
      freelancer_name: "Alice",
      completed: true,
      rating: 5,
      created_at: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "2",
      client_id: mockClientId,
      project_title: "Project B",
      freelancer_name: "Bob",
      completed: false,
      rating: null,
      created_at: "2024-01-02T00:00:00.000Z"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: {},
      query: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe("Input validation", () => {
    it("should call next with BadRequestError when client_id is missing", async () => {
      mockReq.params = {}; // no client_id

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const err = mockNext.mock.calls[0][0];
      expect(err).toBeDefined();
      // controller throws BadRequestError("Invalid Client id format", "INVALID_UUID")
      expect(err).toHaveProperty("message", expect.stringContaining("Invalid Client id format"));
    });

    it("should call next with BadRequestError when client_id is invalid UUID", async () => {
      mockReq.params = { client_id: "not-a-uuid" };
      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const err = mockNext.mock.calls[0][0];
      expect(err).toBeDefined();
      expect(err).toHaveProperty("message", expect.stringContaining("Invalid Client id format"));
    });

    it("should call service when UUID is valid", async () => {
      mockReq.params = { client_id: mockClientId };
      mockTaskService.getTaskRecordsByClient.mockResolvedValue({
        data: sampleRows,
        meta: { page: 1, limit: 20, total_items: 2 }
      });

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClient).toHaveBeenCalledWith(mockClientId, 20, 1, undefined);
    });
  });

  describe("Successful retrieval", () => {
    beforeEach(() => {
      mockReq.params = { client_id: mockClientId };
    });

    it("returns 200 and paginated response on success with default page/limit", async () => {
      mockTaskService.getTaskRecordsByClient.mockResolvedValue({
        data: sampleRows,
        meta: { page: 1, limit: 20, total_items: 2 }
      });

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClient).toHaveBeenCalledWith(mockClientId, 20, 1, undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();

      const sent = mockRes.json.mock.calls[0][0];
      // controller uses buildPaginatedResponse; at minimum ensure data & message exist
      expect(sent).toHaveProperty("data");
      expect(sent).toHaveProperty("message", expect.stringContaining("Task records retrieved successfully"));
      expect(sent.data).toEqual(sampleRows);
    });

    it("respects page & limit query params", async () => {
      mockReq.query = { page: "2", limit: "5" };
      mockTaskService.getTaskRecordsByClient.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 5, total_items: 0 }
      });

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClient).toHaveBeenCalledWith(mockClientId, 5, 2, undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Filtering and params", () => {
    beforeEach(() => {
      mockReq.params = { client_id: mockClientId };
    });

    it("passes completed query param correctly (true)", async () => {
      mockReq.query = { completed: "true" };
      mockTaskService.getTaskRecordsByClient.mockResolvedValue({
        data: sampleRows.filter(r => r.completed),
        meta: { page: 1, limit: 20, total_items: 1 }
      });

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClient).toHaveBeenCalledWith(mockClientId, 20, 1, true);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("passes completed query param correctly (false)", async () => {
      mockReq.query = { completed: "false" };
      mockTaskService.getTaskRecordsByClient.mockResolvedValue({
        data: sampleRows.filter(r => !r.completed),
        meta: { page: 1, limit: 20, total_items: 1 }
      });

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClient).toHaveBeenCalledWith(mockClientId, 20, 1, false);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Service errors", () => {
    beforeEach(() => {
      mockReq.params = { client_id: mockClientId };
    });

    it("forwards service errors to next(err)", async () => {
      const err = new Error("db failure");
      mockTaskService.getTaskRecordsByClient.mockRejectedValue(err);

      await getTaskRecordsByClientHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
