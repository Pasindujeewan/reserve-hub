import { NextRequest, NextResponse } from "next/server";
import { getPublicUser } from "@/lib/auth-service";
import { getSessionUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId(request);

  if (userId === null) {
    return NextResponse.json(
      {
        success: false,
        message: "You are not authenticated",
      },
      { status: 401 },
    );
  }

  try {
    const user = await getPublicUser(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve user",
      },
      { status: 500 },
    );
  }
}
