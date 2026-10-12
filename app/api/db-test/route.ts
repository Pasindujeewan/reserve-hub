import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();

    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Prisma connected to PostgreSQL successfully",
      database: "reservehub",
      userCount,
    });
  } catch (error) {
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
