import { Router, Request, Response } from "express";
import { TaskRecordService } from "../blockchain/task-record.service";

const router = Router();
const taskRecordService = new TaskRecordService();

/**
 * @route   POST /api/tasks/record
 * @desc    Record a task outcome on the blockchain
 * @access  Protected (Admin only)
 */
router.post("/record", async (req: Request, res: Response) => {
  try {
    const { projectId, freelancerId, clientId, completed } = req.body;

    if (
      !projectId ||
      !freelancerId ||
      !clientId ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: projectId, freelancerId, clientId, completed",
      });
    }

    const result = await taskRecordService.recordTaskOutcome(
      projectId,
      freelancerId,
      clientId,
      completed,
    );

    return res.status(201).json({
      success: true,
      data: result,
      message: "Task outcome recorded successfully",
    });
  } catch (error: any) {
    console.error("Error recording task:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to record task outcome",
    });
  }
});

/**
 * @route   GET /api/tasks/freelancer/:freelancerId
 * @desc    Get all tasks for a specific freelancer
 * @access  Public
 */
router.get(
  "/freelancer/:freelancerId",
  async (req: Request<{ freelancerId: string }>, res: Response) => {
    try {
      const { freelancerId } = req.params;

      if (!freelancerId) {
        return res.status(400).json({
          success: false,
          error: "Freelancer ID is required",
        });
      }

      const tasks = await taskRecordService.getTasksForFreelancer(freelancerId);

      return res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error: any) {
      console.error("Error fetching freelancer tasks:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch freelancer tasks",
      });
    }
  },
);

/**
 * @route   GET /api/tasks/client/:clientId
 * @desc    Get all tasks for a specific client
 * @access  Public
 */
router.get(
  "/client/:clientId",
  async (req: Request<{ clientId: string }>, res: Response) => {
    try {
      const { clientId } = req.params;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: "Client ID is required",
        });
      }

      const tasks = await taskRecordService.getTasksForClient(clientId);

      return res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error: any) {
      console.error("Error fetching client tasks:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch client tasks",
      });
    }
  },
);

/**
 * @route   GET /api/tasks/freelancer/:freelancerId/stats
 * @desc    Get statistics for a freelancer
 * @access  Public
 */
router.get(
  "/freelancer/:freelancerId/stats",
  async (req: Request<{ freelancerId: string }>, res: Response) => {
    try {
      const { freelancerId } = req.params;

      if (!freelancerId) {
        return res.status(400).json({
          success: false,
          error: "Freelancer ID is required",
        });
      }

      const stats = await taskRecordService.getFreelancerStats(freelancerId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching freelancer stats:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch freelancer statistics",
      });
    }
  },
);

/**
 * @route   GET /api/tasks/client/:clientId/stats
 * @desc    Get statistics for a client
 * @access  Public
 */
router.get(
  "/client/:clientId/stats",
  async (req: Request<{ clientId: string }>, res: Response) => {
    try {
      const { clientId } = req.params;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: "Client ID is required",
        });
      }

      const stats = await taskRecordService.getClientStats(clientId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching client stats:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch client statistics",
      });
    }
  },
);

export default router;
