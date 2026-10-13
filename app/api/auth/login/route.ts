import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth-schema";
import { authenticateUser } from "@/lib/auth-service";
import { createSessionToken, setSessionCookie } from "@/lib/session";

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

  const result = loginSchema.safeParse(body);

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
    const user = await authenticateUser(result.data);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const token = await createSessionToken(user.userId);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: user,
    });

    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to log in" },
      { status: 500 },
    );
  }
}
