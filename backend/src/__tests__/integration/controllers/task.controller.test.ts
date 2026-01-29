// src/__tests__/integration/controllers/task.controller.test.ts
import { getClientTaskRecords } from "@/controllers/task.controller";
import { taskService } from "@/services/task.service";
import { TaskRecord } from "@/types/task.types";

jest.mock("@/services/task.service");
const mockTaskService = taskService as jest.Mocked<typeof taskService>;

describe("getClientTaskRecords (controller)", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  const mockClientId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  const authReq = {
    user: {
      id: mockClientId
    }
  }

  const mockTaskService = taskService as jest.Mocked<typeof taskService>;

  const sampleRows: TaskRecord[] = [
    {
      id: "1",
      client_id: mockClientId,
      // project_title: "Project A",
      project_id: "project-1",
      freelancer_id: "fr-1",
      completed: true,
      // rating: 5,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "2",
      client_id: mockClientId,
      // project_title: "Project B",
      project_id: "project-2",
      freelancer_id: "fr-2",
      completed: false,
      // rating: null,
      created_at: "2024-01-02T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: {},
      query: {},
      user: { id: mockClientId },
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
      mockReq.user = { }

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const err = mockNext.mock.calls[0][0];
      expect(err).toBeDefined();
      // controller throws BadRequestError("Invalid Client id format", "INVALID_UUID")
      expect(err).toHaveProperty("message", expect.stringContaining("Invalid Client id format"));
    });

    it("should call next with BadRequestError when client_id is invalid UUID", async () => {
      mockReq.user = { client_id: "not-a-uuid" };
      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const err = mockNext.mock.calls[0][0];
      expect(err).toBeDefined();
      expect(err).toHaveProperty("message", expect.stringContaining("Invalid Client id format"));
    });

    it("should call service when UUID is valid", async () => {
      // mockReq.params = { client_id: mockClientId };
      mockReq.user = { id: mockClientId }
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue({
        taskRecords: sampleRows,
        // data: sampleRows,
        meta: { page: 1, limit: 20, total_items: 2 }
      });

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClientId).toHaveBeenCalledWith(mockClientId, 20, 1, undefined);
    });
  });

  describe("Successful retrieval", () => {
    beforeEach(() => {
      // mockReq.params = { client_id: mockClientId };
      mockReq.user = { id: mockClientId };
    });

    it("returns 200 and paginated response on success with default page/limit", async () => {
      mockReq.user = { id: mockClientId };
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue({
        taskRecords: sampleRows,
        // data: sampleRows,
        meta: { page: 1, limit: 20, total_items: 2 }
      });

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClientId).toHaveBeenCalledWith(mockClientId, 20, 1, undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();

      const sent = mockRes.json.mock.calls[0][0];
      // controller uses buildPaginatedResponse; at minimum ensure data & message exist
      expect(sent).toHaveProperty("data");
      expect(sent).toHaveProperty("message", expect.stringContaining("Client task records retrieved successfully"));
      expect(sent.data).toEqual(sampleRows);
    });

    it("respects page & limit query params", async () => {
      mockReq.user = { id: mockClientId };
      mockReq.query = { page: "2", limit: "5" };
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue({
        taskRecords: [],
        meta: { page: 2, limit: 5, total_items: 0 }
      });

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClientId).toHaveBeenCalledWith(mockClientId, 5, 2, undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Filtering and params", () => {
    beforeEach(() => {
      // mockReq.params = { client_id: mockClientId };
      mockReq.user = { id: mockClientId };
    });

    it("passes completed query param correctly (true)", async () => {
      mockReq.query = { completed: "true" };
      mockReq.user = { id: mockClientId };
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue({
        taskRecords: sampleRows.filter(r => r.completed),
        meta: { page: 1, limit: 20, total_items: 20 }
      });

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClientId).toHaveBeenCalledWith(mockClientId, 20, 1, true);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("passes completed query param correctly (false)", async () => {
      mockReq.query = { completed: "false" };
      mockReq.user = { id: mockClientId };
      mockTaskService.getTaskRecordsByClientId.mockResolvedValue({
        taskRecords: sampleRows.filter(r => !r.completed),
        meta: { page: 1, limit: 20, total_items: 1 }
      });

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockTaskService.getTaskRecordsByClientId).toHaveBeenCalledWith(mockClientId, 20, 1, false);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Service errors", () => {
    beforeEach(() => {
      // mockReq.params = { client_id: mockClientId };
      mockReq.user = { id: mockClientId };
    });

    it("forwards service errors to next(err)", async () => {
      mockReq.user = { id: mockClientId };
      const err = new Error("db failure");
      mockTaskService.getTaskRecordsByClientId.mockRejectedValue(err);

      await getClientTaskRecords(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });
});
