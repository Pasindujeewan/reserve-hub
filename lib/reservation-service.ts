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
        },
      });

      if (!resource) {
        throw new Error("RESOURCE_NOT_FOUND");
      }

      if (resource.status !== "AVAILABLE") {
        throw new Error("RESOURCE_UNAVAILABLE");
      }

      const overlappingReservation = await tx.reservation.findFirst({
        where: {
          resourceId: data.resourceId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { reservationId: true },
      });

      if (overlappingReservation) {
        throw new Error("RESERVATION_CONFLICT");
      }

      return tx.reservation.create({
        data: {
          userId,
          resourceId: data.resourceId,
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
