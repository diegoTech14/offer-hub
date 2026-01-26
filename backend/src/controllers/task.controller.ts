import { getTaskRecordsByClient } from "@/services/task.service";
import { BadRequestError, mapSupabaseError } from "@/utils/AppError";
import { buildPaginatedResponse, buildSuccessResponse } from "@/utils/responseBuilder";
import { validateUUID } from "@/utils/validation";
import { NextFunction, Request, Response } from "express";

export async function getTaskRecordsByClientHandler(req: Request, res: Response, next: NextFunction) {
    try {
        // client_id: string, limit: number, page: number, completed?: boolean
        const client_id = req.params.client_id;

        if (!validateUUID(client_id)) {
            throw new BadRequestError("Invalid Client id format", "INVALID_UUID");
        }

        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const page = req.query.page? Number(req.query.page) : 1;
        const completed = req.query.completed === undefined ? undefined : (req.query.completed === 'true');

        const { data, meta } = await getTaskRecordsByClient(client_id, limit, page, completed);

        res.status(200).json(
            buildPaginatedResponse(
                data,
                "Task records retrieved successfully",
                {
                    current_page: meta.page,
                    total_pages: Math.ceil(meta.total_items / (limit || 20)),
                    total_items: meta.total_items,
                    per_page: meta.limit || 20
                }
            )
        )
    } catch (error: any) {
        if (error.code && error.message) {
              throw mapSupabaseError(error);
            }
        
            next(error);
    }
}