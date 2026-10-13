import { NextResponse } from "next/server";
import {
  createResourceSchema,
  resourceStatusSchema,
} from "@/lib/resource-schema";
import { createResource, getResources } from "@/lib/resource-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const rawStatus = searchParams.get("status");
    const rawCategoryId = searchParams.get("categoryId");

    let status: "AVAILABLE" | "MAINTENANCE" | "INACTIVE" | undefined;

    if (rawStatus) {
      const result = resourceStatusSchema.safeParse(rawStatus);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid resource status",
          },
          { status: 400 },
        );
      }

      status = result.data;
    }

    let categoryId: number | undefined;

    if (rawCategoryId !== null) {
      categoryId = Number(rawCategoryId);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid category ID",
          },
          { status: 400 },
        );
      }
    }

    const resources = await getResources({
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
    });

    return NextResponse.json({
      success: true,
      data: resources,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch resources",
      },
      { status: 500 },
    );
  }
}

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

  const result = createResourceSchema.safeParse(body);

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
    const resource = await createResource(result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Resource created successfully",
        data: resource,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create resource. Check that the category exists.",
      },
      { status: 400 },
    );
  }
}
