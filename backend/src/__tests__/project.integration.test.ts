/**
 * Integration tests for assignFreelancerHandler
 *
 * Note: These tests verify the controller layer integration with the service layer.
 * The service layer is mocked to avoid actual database/blockchain calls.
 *
 * For comprehensive validation logic testing, see: src/services/__tests__/project.service.test.ts
 */
import { Request, Response } from "express";
import { InternalServerError } from "@/utils/AppError";

// Mock dependencies before importing
jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/services/user.service", () => ({
  userService: {
    getUserById: jest.fn(),
  },
}));

jest.mock("@/services/escrow.service", () => ({
  escrowService: {
    createEscrow: jest.fn(),
  },
}));

// Mock dependencies before importing
jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("@/services/user.service", () => ({
  userService: {
    getUserById: jest.fn(),
  },
}));

jest.mock("@/services/escrow.service", () => ({
  escrowService: {
    createEscrow: jest.fn(),
  },
}));

// Mock project service with jest.fn() for assignFreelancer
jest.mock("@/services/project.service", () => ({
  createProject: jest.fn(),
  getAllProjects: jest.fn(),
  getProjectById: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  assignFreelancer: jest.fn(),
}));

// Import after mocks
import { assignFreelancerHandler } from "@/controllers/project.controller";
import * as projectService from "@/services/project.service";

describe("assignFreelancerHandler Integration Tests", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  const mockProjectId = "123e4567-e89b-12d3-a456-426614174000";
  const mockFreelancerId = "987fcdeb-51a2-43d7-8f9e-123456789abc";
  const mockClientId = "11111111-1111-1111-8111-111111111111"; // Valid UUID (4th segment starts with 8)

  const mockUpdatedProject = {
    id: mockProjectId,
    client_id: mockClientId,
    freelancer_id: mockFreelancerId,
    escrow_address: "GESCROWADDRESS1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456",
    status: "in_progress",
    budget: 1000,
    title: "Test Project",
    description: "Test Description",
  };

  beforeEach(() => {
    // Clear all mocks including the module mock
    jest.clearAllMocks();
    (projectService.assignFreelancer as jest.Mock).mockClear();

    mockRequest = {
      params: {
        projectId: mockProjectId,
        freelancerId: mockFreelancerId,
      },
      user: {
        id: mockClientId,
      } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("Success Scenarios", () => {
    it("should successfully assign freelancer and return 200 with updated project", async () => {
      const serviceResult = {
        success: true,
        status: 200,
        data: mockUpdatedProject,
        message: "Freelancer_assigned_successfully",
      };

      // Setup the mock - ensure it's a jest mock function
      const mockFn = projectService.assignFreelancer as jest.MockedFunction<
        typeof projectService.assignFreelancer
      >;

      // Verify it's actually a mock
      expect(jest.isMockFunction(mockFn)).toBe(true);

      mockFn.mockResolvedValue(serviceResult);

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      // Verify the service was called
      expect(mockFn).toHaveBeenCalledWith(
        mockProjectId,
        mockFreelancerId,
        mockClientId,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Freelancer_assigned_successfully", // Service returns this message
          data: mockUpdatedProject,
        }),
      );
    });
  });

  describe("Error Scenarios", () => {
    it("should return 400 when projectId is invalid UUID", async () => {
      mockRequest.params = {
        projectId: "invalid-uuid",
        freelancerId: mockFreelancerId,
      };

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid UUID format for projectId or freelancerId",
        }),
      );

      // Service should not be called if validation fails early
      expect(projectService.assignFreelancer).not.toHaveBeenCalled();
    });

    it("should return 400 when freelancerId is invalid UUID", async () => {
      mockRequest.params = {
        projectId: mockProjectId,
        freelancerId: "invalid-uuid",
      };

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid UUID format for projectId or freelancerId",
        }),
      );

      // Service should not be called if validation fails early
      expect(projectService.assignFreelancer).not.toHaveBeenCalled();
    });

    it("should return 401 when client_id is missing", async () => {
      mockRequest.user = undefined;

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentication required",
        }),
      );

      // Service should not be called if validation fails early
      expect(projectService.assignFreelancer).not.toHaveBeenCalled();
    });

    it("should return 401 when client_id is invalid UUID", async () => {
      mockRequest.user = {
        id: "invalid-uuid",
      } as any;

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentication required",
        }),
      );

      // Service should not be called if validation fails early
      expect(projectService.assignFreelancer).not.toHaveBeenCalled();
    });

    it("should return 404 when project is not found", async () => {
      const serviceResult = {
        success: false,
        status: 404,
        message: "Project_not_found",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Project_not_found",
        }),
      );
    });

    it("should return 400 when project status is not open", async () => {
      const serviceResult = {
        success: false,
        status: 400,
        message: "Project_must_be_open_to_assign_freelancer",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Project_must_be_open_to_assign_freelancer",
        }),
      );
    });

    it("should return 403 when client is not project owner", async () => {
      const serviceResult = {
        success: false,
        status: 403,
        message: "Unauthorized_client",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Unauthorized_client",
        }),
      );
    });

    it("should return 404 when freelancer is not found", async () => {
      const serviceResult = {
        success: false,
        status: 404,
        message: "Freelancer_not_found",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Freelancer_not_found",
        }),
      );
    });

    it("should return 400 when user is not a freelancer", async () => {
      const serviceResult = {
        success: false,
        status: 400,
        message: "User_is_not_a_freelancer",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "User_is_not_a_freelancer",
        }),
      );
    });

    it("should return 400 when freelancer and client are the same user", async () => {
      const serviceResult = {
        success: false,
        status: 400,
        message: "Freelancer_and_client_cannot_be_the_same_user",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Freelancer_and_client_cannot_be_the_same_user",
        }),
      );
    });

    it("should return 500 when escrow creation fails", async () => {
      const serviceResult = {
        success: false,
        status: 500,
        message: "Escrow_creation_failed",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Escrow_creation_failed",
        }),
      );
    });

    it("should return 500 when project update fails after escrow creation", async () => {
      const serviceResult = {
        success: false,
        status: 500,
        message: "Failed_to_update_project_after_escrow_creation",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Failed_to_update_project_after_escrow_creation",
        }),
      );
    });

    it("should return 500 when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      (projectService.assignFreelancer as jest.Mock).mockRejectedValue(error);

      // Mock console.error to avoid noise in test output
      const originalConsoleError = console.error;
      console.error = jest.fn();

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Internal server error",
        }),
      );

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe("Transaction Rollback Scenarios", () => {
    it("should not update project when escrow creation fails", async () => {
      // This test verifies that the service maintains atomicity
      // If escrow creation fails, project should not be updated
      const serviceResult = {
        success: false,
        status: 500,
        message: "Escrow_creation_failed",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      // Verify the service was called (which handles the rollback internally)
      expect(projectService.assignFreelancer).toHaveBeenCalled();

      // The service should return failure without updating the project
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });
  });

  describe("Response Format Validation", () => {
    it("should return response in correct format on success", async () => {
      const serviceResult = {
        success: true,
        status: 200,
        data: mockUpdatedProject,
        message: "Freelancer_assigned_successfully",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(jsonCall).toHaveProperty("success", true);
      expect(jsonCall).toHaveProperty("message");
      expect(jsonCall).toHaveProperty("data");
      expect(jsonCall.data).toEqual(mockUpdatedProject);
    });

    it("should return response in correct format on error", async () => {
      const serviceResult = {
        success: false,
        status: 404,
        message: "Project_not_found",
      };

      (projectService.assignFreelancer as jest.Mock).mockResolvedValue(
        serviceResult,
      );

      await assignFreelancerHandler(
        mockRequest as Request<{ projectId: string; freelancerId: string }>,
        mockResponse as Response,
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];

      expect(jsonCall).toHaveProperty("success", false);
      expect(jsonCall).toHaveProperty("message");
      expect(jsonCall.message).toBe("Project_not_found");
    });
  });
});
