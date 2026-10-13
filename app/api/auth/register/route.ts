import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth-schema";
import { registerUser } from "@/lib/auth-service";
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

  const result = registerSchema.safeParse(body);

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
    const resultReg = await registerUser(result.data);

    if ("error" in resultReg) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    const token = await createSessionToken(resultReg.user.userId);

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: resultReg.user,
      },
      { status: 201 },
    );

    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register user",
      },
      { status: 500 },
    );
  }
}
