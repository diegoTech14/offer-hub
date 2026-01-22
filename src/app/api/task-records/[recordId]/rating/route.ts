import { NextRequest, NextResponse } from "next/server";

const ratingStore = new Map<
  string,
  {
    rating: number;
    comment?: string;
    updated_at: string;
  }
>();

function isValidRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const rating = body?.rating;
    const comment = typeof body?.comment === "string" ? body.comment : "";

    if (!recordId) {
      return NextResponse.json(
        { success: false, message: "Missing recordId" },
        { status: 400 }
      );
    }

    if (!isValidRating(rating)) {
      return NextResponse.json(
        { success: false, message: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { success: false, message: "Comment must be 500 characters or less" },
        { status: 400 }
      );
    }

    const updated = {
      rating,
      comment: comment.trim() || undefined,
      updated_at: new Date().toISOString(),
    };

    ratingStore.set(recordId, updated);

    return NextResponse.json({
      success: true,
      message: "Rating updated successfully",
      data: {
        recordId,
        ...updated,
      },
    });
  } catch (error) {
    console.error("Error in rating PATCH API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

