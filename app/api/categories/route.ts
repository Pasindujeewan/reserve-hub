import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createCategorySchema } from "@/lib/category-schema";
import { createCategory, getCategories } from "@/lib/category-service";

// GET /api/categories - Fetch all categories
export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = createCategorySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const category = await createCategory(result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid category data" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 },
    );
  }
}
