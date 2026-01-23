import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

type TaskStatus = "completed" | "in_progress" | "pending";
type TaskRole = "freelancer" | "client";

interface TaskRecord {
  id: string;
  projectTitle: string;
  status: TaskStatus;
  rating?: number;
  completedAt?: string;
  transactionHash?: string;

  // role-specific display fields (frontend expects one of these)
  clientName?: string;
  freelancerName?: string;
}

const DEFAULT_LIMIT = 10;
const TOTAL_RECORDS_PER_USER = 57;

function safeInt(value: string | null, fallback: number): number {
  const n = Number.parseInt(value || "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function pickStatus(): TaskStatus {
  // Weighted so history looks realistic
  const r = faker.number.int({ min: 1, max: 100 });
  if (r <= 65) return "completed";
  if (r <= 85) return "in_progress";
  return "pending";
}

function makeTxHash(): string {
  // Simple mock hash; keep it stable enough for UI
  return `0x${faker.string.hexadecimal({ length: 64, prefix: "", casing: "lower" })}`;
}

function generateRecordsForUser(params: {
  role: TaskRole;
  userId: string;
}): TaskRecord[] {
  const { role, userId } = params;

  // Deterministic data per user+role
  faker.seed(
    [...`${role}:${userId}`].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  );

  return Array.from({ length: TOTAL_RECORDS_PER_USER }, (_, idx) => {
    const status = pickStatus();
    const isCompleted = status === "completed";
    const rating =
      isCompleted && faker.number.int({ min: 1, max: 100 }) <= 70
        ? faker.number.int({ min: 1, max: 5 })
        : undefined;

    const base: TaskRecord = {
      id: `${role}_${userId}_${idx + 1}`,
      projectTitle: faker.company.catchPhrase(),
      status,
      rating,
      completedAt: isCompleted ? faker.date.recent({ days: 180 }).toISOString() : undefined,
      transactionHash: isCompleted ? makeTxHash() : undefined,
    };

    if (role === "freelancer") {
      base.clientName = faker.person.fullName();
    } else {
      base.freelancerName = faker.person.fullName();
    }

    return base;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const role = (searchParams.get("role") || "").toLowerCase() as TaskRole;
    if (role !== "freelancer" && role !== "client") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role. Use role=freelancer or role=client",
          data: [],
          pagination: null,
        },
        { status: 400 }
      );
    }

    const userId = searchParams.get("userId") || "anonymous";
    const statusFilter = (searchParams.get("status") || "").toLowerCase();
    const page = safeInt(searchParams.get("page"), 1);
    const limit = safeInt(searchParams.get("limit"), DEFAULT_LIMIT);

    let records = generateRecordsForUser({ role, userId });

    if (statusFilter && statusFilter !== "all") {
      records = records.filter((r) => r.status === statusFilter);
    }

    const totalRecords = records.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const clampedPage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (clampedPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = records.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      message: "Task records retrieved successfully",
      data: paginated,
      pagination: {
        current_page: clampedPage,
        total_pages: totalPages,
        total_records: totalRecords,
        per_page: limit,
        has_next_page: clampedPage < totalPages,
        has_prev_page: clampedPage > 1,
      },
    });
  } catch (error) {
    console.error("Error in task-records API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: [],
        pagination: null,
      },
      { status: 500 }
    );
  }
}

