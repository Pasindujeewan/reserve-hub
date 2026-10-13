import { NextResponse } from "next/server";
import { updateResourceSchema } from "@/lib/resource-schema";
import {
  deactivateResource,
  getResourceById,
  updateResource,
} from "@/lib/resource-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function parseResourceId(context: RouteContext) {
  const { id } = await context.params;
  const resourceId = Number(id);

  if (!Number.isInteger(resourceId) || resourceId <= 0) {
    return null;
  }

  return resourceId;
}

export async function GET(_request: Request, context: RouteContext) {
  const resourceId = await parseResourceId(context);

  if (resourceId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid resource ID" },
      { status: 400 },
    );
  }

  try {
    const resource = await getResourceById(resourceId);

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: resource,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch resource" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const resourceId = await parseResourceId(context);

  if (resourceId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid resource ID" },
      { status: 400 },
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

  const result = updateResourceSchema.safeParse(body);

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

  if (Object.keys(result.data).length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Provide at least one field to update",
      },
      { status: 400 },
    );
  }

  try {
    const existingResource = await getResourceById(resourceId);

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 },
      );
    }

    const resource = await updateResource(resourceId, result.data);

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update resource. Check that the category exists.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const resourceId = await parseResourceId(context);

  if (resourceId === null) {
    return NextResponse.json(
      { success: false, message: "Invalid resource ID" },
      { status: 400 },
    );
  }

  try {
    const existingResource = await getResourceById(resourceId);

    if (!existingResource) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 },
      );
    }

    if (existingResource.status === "INACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Resource is already inactive",
        },
        { status: 409 },
      );
    }

    const resource = await deactivateResource(resourceId);

    return NextResponse.json({
      success: true,
      message: "Resource deactivated successfully",
      data: resource,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate resource",
      },
      { status: 500 },
    );
  }
}
