import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { createReservationSchema } from "@/lib/reservation-schema";
import {
  createReservation,
  getUserReservations,
} from "@/lib/reservation-service";
import { getSessionUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId(request);

  if (userId === null) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const reservations = await getUserReservations(userId);

    return NextResponse.json({
      success: true,
      data: reservations,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reservations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId(request);

  if (userId === null) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const validation = createReservationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (new Date(validation.data.startTime) <= new Date()) {
    return NextResponse.json(
      {
        success: false,
        message: "Reservation must start in the future",
      },
      { status: 400 },
    );
  }

  try {
    const reservation = await createReservation(userId, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Reservation created successfully",
        data: reservation,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      const messages: Record<string, { message: string; status: number }> = {
        RESOURCE_NOT_FOUND: {
          message: "Resource not found",
          status: 404,
        },
        RESOURCE_UNAVAILABLE: {
          message: "Resource is not available",
          status: 409,
        },
        RESERVATION_CAPACITY_EXCEEDED: {
          message: "Not enough units are available for that time. Choose fewer units or another time.",
          status: 409,
        },
      };

      const knownError = messages[error.message];

      if (knownError) {
        return NextResponse.json(
          { success: false, message: knownError.message },
          { status: knownError.status },
        );
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Reservation conflict. Please try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create reservation" },
      { status: 500 },
    );
  }
}
