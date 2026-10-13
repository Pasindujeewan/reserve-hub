import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput } from "@/lib/category-schema";

// get all categories
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      categoryName: "asc",
    },
  });
}

// create a new category
export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      categoryName: data.categoryName,
      description: data.description,
    },
  });
}
