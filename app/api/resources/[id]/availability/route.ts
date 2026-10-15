import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if ((await getSessionUserId(request)) === null) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const resourceId = Number(id);
  if (!Number.isSafeInteger(resourceId) || resourceId <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid resource ID" },
      { status: 400 },
    );
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        resourceId,
        status: { in: ["PENDING", "CONFIRMED"] },
        endTime: { gt: new Date() },
      },
      select: { startTime: true, endTime: true, status: true, quantity: true },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ success: true, data: reservations });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load reserved time periods" },
      { status: 500 },
    );
  }
}
