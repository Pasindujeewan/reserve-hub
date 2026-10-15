import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateReservationInput } from "@/lib/reservation-schema";

export async function getUserReservations(userId: number) {
  return prisma.reservation.findMany({
    where: { userId },
    include: {
      Resource: {
        include: { Category: true },
      },
    },
    orderBy: { startTime: "desc" },
  });
}

export async function getUserReservation(
  reservationId: number,
  userId: number,
) {
  return prisma.reservation.findFirst({
    where: { reservationId, userId },
    include: {
      Resource: {
        include: { Category: true },
      },
    },
  });
}

export async function createReservation(
  userId: number,
  data: CreateReservationInput,
) {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  return prisma.$transaction(
    async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { resourceId: data.resourceId },
        select: {
          resourceId: true,
          status: true,
          capacity: true,
        },
      });

      if (!resource) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      if (resource.status !== "AVAILABLE") {
        throw new Error("RESOURCE_UNAVAILABLE");
      }

      if (data.quantity > resource.capacity) {
        throw new Error("RESERVATION_CAPACITY_EXCEEDED");
      }

      const overlappingReservations = await tx.reservation.findMany({
        where: {
          resourceId: data.resourceId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { startTime: true, endTime: true, quantity: true },
      });

      const events = overlappingReservations
        .flatMap((reservation) => [
          {
            time: Math.max(startTime.getTime(), reservation.startTime.getTime()),
            change: reservation.quantity,
          },
          {
            time: Math.min(endTime.getTime(), reservation.endTime.getTime()),
            change: -reservation.quantity,
          },
        ])
        .sort((a, b) => a.time - b.time || a.change - b.change);

      let reservedQuantity = 0;
      let peakReservedQuantity = 0;
      for (const event of events) {
        reservedQuantity += event.change;
        peakReservedQuantity = Math.max(peakReservedQuantity, reservedQuantity);
      }

      if (peakReservedQuantity + data.quantity > resource.capacity) {
        throw new Error("RESERVATION_CAPACITY_EXCEEDED");
      }

      return tx.reservation.create({
        data: {
          userId,
          resourceId: data.resourceId,
          quantity: data.quantity,
          startTime,
          endTime,
          status: "PENDING",
        },
        include: {
          Resource: {
            include: { Category: true },
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function cancelUserReservation(
  reservationId: number,
  userId: number,
) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findFirst({
      where: { reservationId, userId },
    });

    if (!reservation) {
      throw new Error("RESERVATION_NOT_FOUND");
    }

    if (
      reservation.status !== "PENDING" &&
      reservation.status !== "CONFIRMED"
    ) {
      throw new Error("RESERVATION_NOT_CANCELLABLE");
    }

    return tx.reservation.update({
      where: { reservationId },
      data: { status: "CANCELLED" },
      include: {
        Resource: {
          include: { Category: true },
        },
      },
    });
  });
}
