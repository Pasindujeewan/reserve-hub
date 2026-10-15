import { NextRequest, NextResponse } from "next/server";
import {
  cancelUserReservation,
  getUserReservation,
} from "@/lib/reservation-service";
import { getSessionUserId } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function parseReservationId(context: RouteContext) {
  const { id } = await context.params;
  const reservationId = Number(id);

  if (!Number.isSafeInteger(reservationId) || reservationId <= 0) {
    return null;
  }

  return reservationId;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId(request);

  if (userId === null) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const reservationId = await parseReservationId(context);

  if (reservationId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid reservation ID" },
      { status: 400 },
    );
  }

  try {
    const reservation = await getUserReservation(reservationId, userId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reservation" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId(request);

  if (userId === null) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const reservationId = await parseReservationId(context);

  if (reservationId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid reservation ID" },
      { status: 400 },
    );
  }

  // Only cancellation is supported by this endpoint.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    body.status !== "CANCELLED" ||
    Object.keys(body).length !== 1
  ) {
    return NextResponse.json(
      {
        success: false,
        message: 'Send { "status": "CANCELLED" } to cancel',
      },
      { status: 400 },
    );
  }

  try {
    const reservation = await cancelUserReservation(reservationId, userId);

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "RESERVATION_NOT_FOUND") {
        return NextResponse.json(
          { success: false, message: "Reservation not found" },
          { status: 404 },
        );
      }

      if (error.message === "RESERVATION_NOT_CANCELLABLE") {
        return NextResponse.json(
          {
            success: false,
            message: "This reservation cannot be cancelled",
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel reservation",
      },
      { status: 500 },
    );
  }
}
