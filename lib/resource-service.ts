import { prisma } from "@/lib/prisma";
import type {
  CreateResourceInput,
  UpdateResourceInput,
} from "@/lib/resource-schema";

type ResourceFilters = {
  search?: string;
  status?: "AVAILABLE" | "MAINTENANCE" | "INACTIVE";
  categoryId?: number;
};

export async function getResources(filters: ResourceFilters = {}) {
  const { search, status, categoryId } = filters;

  return prisma.resource.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              {
                resourceType: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                location: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    include: {
      Category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getResourceById(resourceId: number) {
  return prisma.resource.findUnique({
    where: { resourceId },
    include: {
      Category: true,
    },
  });
}

export async function createResource(data: CreateResourceInput) {
  return prisma.resource.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      resourceType: data.resourceType,
      location: data.location,
      capacity: data.capacity,
      categoryId: data.categoryId,
      ...(data.status ? { status: data.status } : {}),
    },
    include: {
      Category: true,
    },
  });
}

export async function updateResource(
  resourceId: number,
  data: UpdateResourceInput,
) {
  return prisma.resource.update({
    where: { resourceId },
    data,
    include: {
      Category: true,
    },
  });
}

export async function deactivateResource(resourceId: number) {
  return prisma.resource.update({
    where: { resourceId },
    data: {
      status: "INACTIVE",
    },
    include: {
      Category: true,
    },
  });
}
